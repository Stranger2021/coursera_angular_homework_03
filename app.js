(function () {
'use strict';

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController)
.service('MenuSearchService', MenuSearchService)
.constant('PathApi', "https://davids-restaurant.herokuapp.com")
.directive('foundItems', FoundItems);

// Пользовательская директива (для реализации шаблона)
function FoundItems() {
  var ddo = {
    templateUrl: "menuitem.html", // Шаблон, который отвечает за директиву
    //restrict: 'AE',
    scope: {
      myFoundItems: '<',    // слева - как использовать в директиве, справа - имя атрибута
      onRemove: '&',
      title: '<'
    }
  };

  return ddo;
}


// ************ //
// MAIN-CONTROLLER
NarrowItDownController.$inject = ['MenuSearchService'];
function NarrowItDownController(MenuSearchService) {
  var menu = this;

  menu.searchText = "";

  // Генерация заголовка таблицы с указание кол-ва элементов
  menu.title = function() {
    return MenuSearchService.UpdateTitle();
  }

  // Наличие элементов в списке
  menu.IsFindItems = function() {
    return MenuSearchService.IsFindItems();
  }

  // Нажатие на кнопку "Narrow It Down For Me!" - поиск записей в соответствии с фильтром
  menu.searchItems = function() {

      // Получение данных с помощью асинхронного сервиса http
      var promise = MenuSearchService.getAllMenuItems();

      promise
      .then( function(response) {
          // Удачный ответ с сервера
          menu.foundItems = MenuSearchService.getMatchedMenuItems(response, menu.searchText);
      })
      .catch(function(error) {
          // Неудачный ответ с сервера
          console.log("Error: Get data from server");
      });
  };

  // Удаление элемента из списка
  menu.removeItem = function (itemIndex) {
    menu.foundItems = MenuSearchService.removeItem(itemIndex);
  };
}


// ************* //
//SERVICE-FUNCTION
MenuSearchService.$inject = ['$http', 'PathApi'];
function MenuSearchService($http, PathApi) {
  var service = this;

  // Итоговый массив данных
  var foundItems = [];

  // Функция для поиска вхождения текста в свойства элементов массива
  function MyInclude(elementOfList, searchTerm) {
    var strNew = searchTerm.toLowerCase();

    if ((elementOfList.short_name != null)         && (elementOfList.short_name.toLowerCase().includes(strNew)) )          { return true; };
    if ((elementOfList.name != null)               && (elementOfList.name.toLowerCase().includes(strNew)) )                { return true; };
    if ((elementOfList.description != null)        && (elementOfList.description.toLowerCase().includes(strNew)) )         { return true; };
    if ((elementOfList.small_portion_name != null) && (elementOfList.small_portion_name.toLowerCase().includes(strNew)) )  { return true; };
    if ((elementOfList.large_portion_name != null) && (elementOfList.large_portion_name.toLowerCase().includes(strNew)) )  { return true; };
  }

  // Наличие записей в массиве
  service.IsFindItems = function () {
    return (foundItems.length > 0);
  }

  //Обновление заголовка списка
  service.UpdateTitle = function() {
    if (service.IsFindItems()) {
      return "List of Menu (" + foundItems.length +")";
    } else {
      return "Nothing found";
    };
  }

  // Функция для подключения к серверу и загрузки данных о пунктах меню
  service.getAllMenuItems = function () {
    var response = $http({
      method: "GET",
      url: (PathApi + "/menu_items.json")
    });

    return response;
  }

  // Получение отфильтрованного списка с сервера
  service.getMatchedMenuItems = function (response, searchTerm) {

    // При успешном ответе, анализируем элементы и формируем новый массив
    var items = response.data.menu_items;

    // Поиск нужных записей и сохранение их в массив foundItems
    if (searchTerm != "") {
      for (var i=0; i<items.length; i++) {
        if (MyInclude(items[i], searchTerm) == true) {
          foundItems.push(items[i]);
        }
      }
    };

    // Возвращаем массив отфильтрованных записей
    //console.log("Найдено записей: " + foundItems.length);
    return foundItems;
  }

  //Удаление элемента из списка
  service.removeItem = function (itemIndex) {
    foundItems.splice(itemIndex, 1);
    return foundItems;
  };

}

})();
