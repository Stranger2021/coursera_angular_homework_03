(function () {
'use strict';

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController)
.service('MenuSearchService', MenuSearchService)
.constant('PathApi', "https://davids-restaurant.herokuapp.com")
.directive('foundItems', FoundItems)
.directive('myFoundItems', MyFoundItems);


// Пользовательская директива (для реализации шаблона)
function FoundItems() {
  var ddo = {
    templateUrl: "menuitem.html" // Шаблон, который отвечает за директиву
  }

  return ddo;
}

// Пользовательская директива (свойство директивы)
function MyFoundItems() {
  var ddo = {
    scope: {
      menu: '<myFoundItems',       // Свойство директивы, которое передает список отфильтрованных записей
      title: '@'
    },
    controller: NarrowItDownController,
    controllerAs: 'menu',
    bindToController: true
  }

  return ddo;
}


// ************ //
// MAIN-CONTROLLER
NarrowItDownController.$inject = ['MenuSearchService'];
function NarrowItDownController(MenuSearchService) {
  var menu = this;

  menu.foundItems = [];
  menu.searchText = "";
  menu.title = "Nothing found";

 // Функция для поиска вхождения текста в свойства элементов массива
 function MyInclude(elementOfList) {
   var strNew = menu.searchText.toLowerCase();

   if ((elementOfList.short_name != null)         && (elementOfList.short_name.toLowerCase().includes(strNew)) )          { return true; };
   if ((elementOfList.name != null)               && (elementOfList.name.toLowerCase().includes(strNew)) )                { return true; };
   if ((elementOfList.description != null)        && (elementOfList.description.toLowerCase().includes(strNew)) )         { return true; };
   if ((elementOfList.small_portion_name != null) && (elementOfList.small_portion_name.toLowerCase().includes(strNew)) )  { return true; };
   if ((elementOfList.large_portion_name != null) && (elementOfList.large_portion_name.toLowerCase().includes(strNew)) )  { return true; };
 }

 // Найдены ли записи?
 menu.IsFindItems = function () {
    return (menu.foundItems.length > 0);
 };

 // Обновление заголовка списка
 function UpdateTilte() {
   if (menu.IsFindItems()) {
     menu.title = "List of Menu (" + menu.foundItems.length +")";
   } else {
     menu.title = "Nothing found";
   };
 }

  // Нажатие на кнопку "Narrow It Down For Me!"
  menu.searchItems = function() {

    menu.foundItems = [];

    // Ожидание ответа от сервера (получение итогового массива данных)
    var promise = MenuSearchService.getMatchedMenuItems();

    promise.then(function (response) {
      // При успешном ответе, анализируем элементы и формируем новый массив
      menu.items = response.data.menu_items;

      // Поиск нужных записей и сохранение их в массив foundItems
      if (menu.searchText != "") {
        for (var i=0; i<menu.items.length; i++) {
          if (MyInclude(menu.items[i]) == true) {
            menu.foundItems.push(menu.items[i]);
          }
        }
      }

      // Изменение названия списка
     UpdateTilte();
    })
    .catch(function (error) {
      console.log("Something went terribly wrong.");
    });
  };


  // Удаление элемента из списка
  menu.removeItem = function (itemIndex) {
    menu.foundItems.splice(itemIndex, 1);
    UpdateTilte();
  };
}


// ************* //
//SERVICE-FUNCTION
MenuSearchService.$inject = ['$http', 'PathApi'];
function MenuSearchService($http, PathApi) {
  var service = this;

  service.getMatchedMenuItems = function () {
    var response = $http({
      method: "GET",
      url: (PathApi + "/menu_items.json")
      // params: {
      //   category: shortName
      // }
    });

    return response;
  };
}

})();






// Объявите и создайте MenuSearchService. 
// Сервис должен иметь следующий метод: getMatchedMenuItems(searchTerm). 
// Этот метод будет отвечать за обращение к серверу (используя службу $http)
// для получения списка всех пунктов меню. Как только он получит все пункты меню,
// он должен перебрать их, чтобы выбрать те, чье описание соответствует поисковому термину. 
// Как только список найденных элементов будет скомпилирован, он должен вернуть
// этот список (завернутый в обещание). 
//
// Помните, что сама then-функция возвращает обещание. Ваш метод примерно будет выглядеть так:
