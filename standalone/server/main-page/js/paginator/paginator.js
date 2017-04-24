/*--------------------------------------------------
:: Common Paginator Variables
-------------------------------------------------*/
var pagClass = ".c-paginator",
    idCounter = 0,
    asyncPaginators = {};

/*--------------------------------------------------
:: Paginator function services
--------------------------------------------------*/
function getHalfwayRange(nPages, newPage, maxPagesShown) {
    if (newPage > nPages){
        return [];
    }

    if((newPage - maxPagesShown) < 0){
        return [1, maxPagesShown];
    }

    for (var firstLink = (newPage-1); firstLink > ((newPage-1) - maxPagesShown);firstLink--){
        if((firstLink + maxPagesShown - 1) <= nPages){
            return [firstLink, nPages - 1];
        }
    }
    
    return [(newPage - maxPagesShown + 1), newPage];
}

function defineInitIndexes(nPages, current, maxPagesShown) {
    var initIndex, endIndex;

    if ((current + maxPagesShown) > (nPages + 1)) {
        initIndex = nPages - maxPagesShown + 1;
        endIndex = nPages;
    } else if ((current + maxPagesShown) === (nPages + 1)) {
        initIndex = (current > 1) ? (current - 1) : 1;
        endIndex = (nPages > maxPagesShown) ? (nPages - 1) : nPages;
    } else {
        initIndex = (current > 1) ? (current - 1) : 1;
        endIndex = initIndex + maxPagesShown - 1;
    }

    return {
        init: initIndex,
        end: endIndex
    };
}

/*--------------------------------------------------
:: Paginator private functions (with context)
--------------------------------------------------*/
function checkUseZen(conditions){
    if(conditions){
        this.$main.addClass("use-zen");
    }
}

function manageBlockControls(settings){
    if(!settings.collapseAllCntrl){
        return true;
    }

    var $block = $(this),
        anyCntrlVisible = false;

    $block.children().each(function () {
        anyCntrlVisible |= $(this).css("display") !== "none";
    });

    $block.css("display", anyCntrlVisible ? "" : "none");
}

//Updates the total page and current counter
function updatePageCounter(current, nPages) {
    $(".c-paginator__counter-current",  this.$counter).html(current);
    $(".c-paginator__counter-total",  this.$counter).html(nPages);
}  

//Updates the data of the page links whether it would be necessary
function managePageLinks(nPages, newPage, maxPagesShown) {
    var $newPageLink = $(".js-page-action[data-index='" + newPage + "']", this.$nav);
    maxPagesShown = typeof maxPagesShown === "number" ? ((maxPagesShown < nPages) ? maxPagesShown : nPages) : nPages;

    // 1º Check conditions to update the data of PageLinks
    //$newPageLink.length==0 => Page is not on the current PageLinks Layout, (first or last action released)
    if ($newPageLink.hasClass("is-first-link") || $newPageLink.hasClass("is-last-link") || $newPageLink.length === 0) {
        var newRange = [];

        if ($newPageLink.hasClass("is-first-link")) {//First link of the current link page range clicked
            if (($newPageLink.data("link-index") !== $newPageLink.attr("data-index"))) {
                newRange = [Number($newPageLink.attr("data-index") - maxPagesShown + 2), Number($newPageLink.attr("data-index")) - 1];
                
                if (newRange[0] < 1) {
                    newRange = [1, maxPagesShown];
                }

            }
        } else if ($newPageLink.hasClass("is-last-link")) {//Last link of the current link page range clicked
            if ($newPageLink.attr("data-index") !== nPages) {
                newRange = [Number($newPageLink.attr("data-index")) - 1, Number($newPageLink.attr("data-index")) + maxPagesShown - 2];
                
                if (newRange[1] > nPages) {
                    newRange = [nPages - maxPagesShown + 1, nPages];
                }
            }
        } else {//($newPageLink.length==0) => 'First' or 'Last'  clicked and released
            if (newPage === 1) {
                newRange = [1, maxPagesShown];
            }
            else if (newPage === nPages){
                newRange = [nPages - maxPagesShown + 1, nPages];
            }
            else{
                newRange = getHalfwayRange(nPages, newPage, maxPagesShown);
            }
        }

        //2º The data of the pageLinks is going to be updated
        if (newRange.length === 2) {
            var currentIndex = newRange[0];

            $newPageLink.removeClass("is-current-page");

            for (var i = 1; i <= maxPagesShown; i++) {
                var $nodeLink = $(".js-page-action[data-link-index='" + i + "']", this.$nav);

                //Modify the required data
                $nodeLink.attr("data-index", String(currentIndex));
                $nodeLink.html(currentIndex);

                if (currentIndex === newPage) {
                    $nodeLink.addClass("is-current-page");
                }

                currentIndex++;
            }
        }
    }
}

//Retrieves the current range of Pages Links shown
function getShownRange() {
    var init = parseInt($(".is-first-link", this.$nav).attr("data-index"), 10);
    var end = parseInt($(".is-last-link", this.$nav).attr("data-index"), 10);

    if (init && end) {
        return [init, end];
    }

    return false;
}

//Manage visiblity and layout access to controls First/Prev/Next/Last button actions
function manageControls(newPage, nPages, nPagesShown) {
    //1º Manage left control (Prev)
    $(".js-prev-action", this.$nav).parent().css("display", (newPage !== 1) ? "inline-block" : "none");
    //2º Manage right control (Next)
    $(".js-next-action", this.$nav).parent().css("display", (newPage !== nPages) ? "inline-block" : "none");
    
    var newRange = getShownRange.call(this);
    
    if (newRange || this.settings.useZen) {
        var showFirstAction = this.settings.useZen ? (newPage !== 1) : (newRange[0] !== 1),
            showLastAction = this.settings.useZen ? (newPage !== nPages)  : (newRange[1] < nPages);

        //3º Manage left control (First)
        $(".js-first-action", this.$nav).parent().css("display", showFirstAction ? "inline-block" : "none");
        //4º Manage right control (Last)
        $(".js-last-action", this.$nav).parent().css("display", showLastAction ? "inline-block" : "none");    
    }
    
    //5º Manage left block controls
    manageBlockControls.call($(".c-paginator__prev-controls", this.$nav), this.settings);
    //6º Manage right block controls
    manageBlockControls.call($(".c-paginator__next-controls", this.$nav), this.settings);
}


//Updates the Layout and data of the PageLinks and Controls
var updateLayout = function(newPage, oldPage) {
    var layoutPagesMod = false,
        range = getShownRange.call(this);

    if (range) {
        if ((newPage <= range[0]) || (newPage >= range[1])) {
            managePageLinks.call(this, this.nPages, newPage, this.nPagesShown);
            layoutPagesMod = true;
        }
    }    

    manageControls.call(this, newPage, this.nPages, this.nPagesShown);

    return layoutPagesMod;
};

//Manage action click on 'prev'
function prevPage($oldPageLink) {
    //var oldPage = parseInt($oldPageLink.attr("data-index"), 10),
    var oldPage = this.current,
        layoutPagesMod;        

    $oldPageLink.removeClass("is-current-page");
    layoutPagesMod = updateLayout.call(this, oldPage - 1, oldPage);

    if (!layoutPagesMod) {
        $oldPageLink.parent().prev().children(".js-page-action").addClass("is-current-page");
    }

    return oldPage - 1;
}

//Manage action click on 'next'
function nextPage($oldPageLink) {
    //var oldPage = parseInt($oldPageLink.attr("data-index"), 10),
    var oldPage = this.current,
        layoutPagesMod;

    $oldPageLink.removeClass("is-current-page");
    layoutPagesMod = updateLayout.call(this, oldPage + 1, oldPage);

    if (!layoutPagesMod) {
        $oldPageLink.parent().next().children(".js-page-action").addClass("is-current-page");
    }

    return oldPage + 1;
}

//Manage action click on 'first'
function firstPage($oldPageLink) {
    var $newPageLink = $(".js-page-action[data-index='" + 1 + "']", this.$nav).first(),
        oldPage = parseInt($oldPageLink.attr("data-index"), 10),
        layoutPagesMod;

    $oldPageLink.removeClass("is-current-page");
    layoutPagesMod = updateLayout.call(this,1, oldPage);

    if (!layoutPagesMod) {
        $newPageLink.addClass("is-current-page");
    }

    return 1;
}

//Manage action click on 'last'
function lastPage($oldPageLink) {
    var $newPageLink = $(".js-page-action[data-index='" + this.nPages + "']", this.$nav).first(),
        oldPage = parseInt($oldPageLink.attr("data-index"), 10),
        layoutPagesMod;

    $oldPageLink.removeClass("is-current-page");
    layoutPagesMod = updateLayout.call(this, this.nPages, oldPage);

    if (!layoutPagesMod) {
        $newPageLink.addClass("is-current-page");
    }

    return this.nPages;
}

//Manage the action click on a PageLink
function linkPage($oldPageLink, $newPageLink) {
    var newPage = parseInt($newPageLink.attr("data-index")),
        oldPage = parseInt($oldPageLink.attr("data-index")),
        layoutPagesMod = updateLayout.call(this, newPage, oldPage);

    if (!layoutPagesMod) {
        $newPageLink.addClass("is-current-page");
    }

    return newPage;
}

//Handles each action selected
function manageNewAction($newPageLink, $oldPageLink, action) {
    switch (action) {
        case "page":
            return linkPage.call(this, $oldPageLink, $newPageLink);
        case "next":
            return nextPage.call(this, $oldPageLink);
        case "prev":
            return prevPage.call(this, $oldPageLink);
        case "first":
            return firstPage.call(this, $oldPageLink);
        case "last":
            return lastPage.call(this, $oldPageLink);
        default:
            return false;
    }
}

//Treats any action attached to the links created on the layout
function clickActionLink($newPageLink) {
    var $oldPageLink = $(".is-current-page", this.$nav).first();

    if ($oldPageLink.get(0) !== $newPageLink.get(0)) {
        var $regex = /(\w+)(-action)/; //{'page','next','prev','first','last'}
        if ($regex.test($newPageLink[0].className)) {
            var action = $regex.exec($newPageLink[0].className)[1];
            var actionList = ["page", "next", "prev", "first", "last"];

            if ($.inArray(action, actionList) !== -1) {
                $oldPageLink.removeClass("is-current-page");
                var newPage = manageNewAction.call(this, $newPageLink, $oldPageLink, action);

                if (newPage) {
                    this.current = newPage;
                    window.tempModuleLoadObj = window.tempModuleLoadObj || {};
                    window.tempModuleLoadObj.event = "component-page-change";

                    this.$main.attr("data-page", Number(newPage)).trigger("change");
                    updatePageCounter.call(this, newPage, this.nPages);

                    if(this.settings.triggerEvent){
                        console.log(newPage);
                        console.log(this.id);
                        this.$main.trigger("onPageChange", newPage);
                    }
                }
            }
        }
    }
}

//Creates the main layout
function createPageLinks(nPages, current, maxPagesShown) {
    var _this = this;
    
    //1º Define jQuery vars
    var $prevControls,
        $nextControlsChild,
        $nextControls,
        $prevControlsChild,
        $newLink,
        $selectors;

    //2º Get the delimiter defined by the user, if it exists
    var delimiter = _this.settings.delimiter || " of ";

    //3º Define Start/End current visible indexes
    var indexes = defineInitIndexes(nPages, current, maxPagesShown),
        initIndex = indexes.init,
        endIndex = indexes.end,
        currentIndex = initIndex,
        currentLinkIndex;


    maxPagesShown = typeof maxPagesShown === "number" ? maxPagesShown : nPages;

    if (maxPagesShown > nPages) {
        maxPagesShown = nPages;
    }

    //4º.- Removes the previous content if exists
    this.remove();

    //5º.- Insert main containers
    this.$counter = $("<div class='c-paginator__counter'><span class='c-paginator__counter-current'></span>"+delimiter+"<span class='c-paginator__counter-total'></span></div>").appendTo(this.$main);
    this.$nav = $("<div class='c-paginator__navigation'></div>").appendTo(this.$main);

    //$prevControls = $(".c-paginator__prev-controls", $nav);
    
    //6º.- Insert Prev Controls
    $prevControls = $("<div class='c-paginator__prev-controls'></div>").prependTo(this.$nav);
    $prevControls.prepend("<div class='c-paginator__page-selector' " + (((nPages === 1) || (current === 1)) ? "style='display:none'" : true) + "><a class='c-paginator__page-selector-link js-prev-action' href='#''></a></div>");
    $prevControls.prepend("<div class='c-paginator__page-selector' " + ((initIndex === 1) ? "style='display:none'": true) + "><a class='c-paginator__page-selector-link js-first-action' href='#'></a></div>");
    manageBlockControls.call($prevControls, this.settings);

    //7º.- Insert Link Pages
    if(!!!this.settings.useZen){
        currentLinkIndex = 1;
        while (currentIndex <= endIndex) {
            $newLink = $("<div class='c-paginator__page-selector'><a class='c-paginator__page-selector-link js-page-action' href='#' data-link-index='" + 
                currentLinkIndex + "' data-index='" + currentIndex + "'>" + currentIndex + "</a></div>")
                .appendTo(this.$nav);

            if (currentIndex === initIndex) {
                $newLink.children(".js-page-action").addClass("is-first-link");
            }

            if (currentIndex === endIndex) {
                $newLink.children(".js-page-action").addClass("is-last-link");
            }

            currentIndex++;
            currentLinkIndex++;
        }
    }

    //8º.- Mark current link Page
    $(".js-page-action[data-index='" + current + "']", this.$nav).addClass("is-current-page");

    //9º.- Insert Next Controls
    //$(".c-paginator__next-controls", $nav);
    $nextControls = $("<div class='c-paginator__next-controls'></div>").appendTo(this.$nav);
    $nextControls.append("<div class='c-paginator__page-selector' " + (((nPages === 1) || (current === nPages)) ? "style='display:none'" : "") + "><a class='c-paginator__page-selector-link js-next-action' href='#'></a></div>");
    $nextControls.append("<div class='c-paginator__page-selector' " + (((nPages === 1) || (nPages <= maxPagesShown) || (nPages === endIndex)) ? "style='display:none'" : "") + "><a class='c-paginator__page-selector-link js-last-action' href='#'></a></div>");
    manageBlockControls.call($nextControls, this.settings);

    //10º.- Update page counter
    updatePageCounter.call(this, current, nPages);

    //11º.- Bind the event to all nodes
   this.$nav.on("click",".c-paginator__page-selector-link", function(event) {
        event.preventDefault();
        var $newPageLink = $(event.currentTarget, _this.$nav);
        clickActionLink.call(_this, $newPageLink);
    });

   $nextControlsChild = $nextControls.children();
   $prevControlsChild = $prevControls.children();

   $nextControlsChild.addClass("c-paginator__control");
   $prevControlsChild.addClass("c-paginator__control");

   if ($(window).width() < 768) {
        $prevControls.after(this.$counter);
   } else {
        $prevControls.before(this.$counter);
   }

   $prevControls.nextAll(".c-paginator__page-selector").wrapAll("<div class='c-paginator__page-selectors'></div>");

   //12º Special behaviour to have controls (prev and next) with the page selectors on the same grid (c-paginator__[prev|next]-controls) disappear
   if(!!this.settings.allResponsive){
        $selectors = $(".c-paginator__page-selectors", this.$nav); 
        //With float to right, put the last child at first
        $prevControlsChild.parent().prepend($prevControlsChild.last());
        
        //Unwrap the controls individual divs and put them on the same wrap div than the selectors
        $selectors.prepend($prevControlsChild.parent());
        $selectors.append($nextControlsChild.parent());
    }
}

/*--------------------------------------------------
:: Paginator Class
--------------------------------------------------*/
function Paginator($parent, params) {
    //Data vars
    this.id = idCounter; 
    idCounter++;

    this.nItemsPage = 5,
    this.nItemsTotal = 50,//50 //100
    this.nPages = Math.ceil(this.nItemsTotal / this.nItemsPage),
    this.nPagesShown = 10, //10 //Min 3
    this.settings = {
        allResponsive: false,
        triggerEvent: true,
        collapseAllCntrl:true
    },
    this.current = 1,
    
    //jQuery selectors
    this.$main = this.$main || null,
    this.$nav = null,
    this.$counter = null;

    //init function
    var init = function() //Init
    {
        this.nItemsTotal = params.nItemsTotal || this.nItemsTotal;
        this.nItemsPage = params.nItemsPage || this.nItemsPage;
        this.nPagesShown = params.nPagesShown || this.nPagesShown;
        this.nPages = params.nPages || Math.ceil(this.nItemsTotal / this.nItemsPage);
        $.extend(this.settings, params.settingsTheme);

        if (this.nPagesShown > this.nPages) {
            this.nPagesShown = this.nPages;
        }
    };
    
    //main function
    var main = function() //Init the Paginator Asynchronously
    {
        this.current = typeof params.current === "number" ? params.current : 1;
        params.settingsTheme = typeof params.settingsTheme === "object" ? params.settingsTheme : {};  
        init.call(this, params);
        this.$main = this.$main || (($parent instanceof $) ? $parent.find(pagClass) : $(pagClass));

        if (this.nPagesShown > 1) {
            if(params.settingsTheme && params.settingsTheme.useZen){
                checkUseZen.call(this, true);
            }
            
            createPageLinks.call(this, this.nPages, this.current, this.nPagesShown);
        }
        else {
            this.remove();
        }
    };

    main.call(this, params);

    return this;
}

/*--------------------------------------------------
:: Paginator Prototype public functions
--------------------------------------------------*/

//Removes the content of the paginator
Paginator.prototype.remove = function() {
    var instance = "paginator_" + this.id;
    
    this.$main.empty();

    if(asyncPaginators.hasOwnProperty(instance)){
        asyncPaginators[instance] = null;
    }
};

//Goes to a link of paginator
Paginator.prototype.goLink = function(indexLink, indexOldLink){
    var oldPage, layoutPagesMod, $oldPageLink, $newPageLink, $linkNodes;
    
    if(indexOldLink === null){
        $oldPageLink = $(".is-current-page", this.$nav).first();
        oldPage = parseInt($oldPageLink.attr("data-index"), 10);
        
        $oldPageLink.removeClass("is-current-page");
    }

    layoutPagesMod = updateLayout.call(this, indexLink, oldPage);
    $linkNodes = $(".c-paginator__page-selectors .js-page-action", this.$nav);

    $newPageLink = $linkNodes.filter(function(){
        return $(this).attr("data-index") === String(indexLink);
    });

    $newPageLink.addClass("is-current-page");

    return true;
};

//When the DOM has been created, create the links inside the container properly
$(document).ready(function() {
    if (($(pagClass).is("*")) && ($(pagClass).data("isAsync") !== true)) {

        //Filter paginators whose want to be initialized on load document
        var $pagSync = $(pagClass).filter(function(){
            return $(this).data("isAsync") !== true;
        });

        //Create the instance of each paginator
        $pagSync.each(function() {
            var $paginator = $(this), 
                Prebound = Object.create(Paginator.prototype || Object.prototype),
                params = $paginator.data("params") || {};
            
            Prebound.$main = $paginator;

            asyncPaginators["paginator_" + idCounter] = Paginator.call(Prebound, null, params) || Prebound;
        });
    }

});

//Create jQuery method
(function( $ ){
    $.fn.paginator = function() {
        var args = arguments,
            paginator = new Paginator($(this).parent(), args[0]);

        return paginator;
    }; 
})( jQuery );
