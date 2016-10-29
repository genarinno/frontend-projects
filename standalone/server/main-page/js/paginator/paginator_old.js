
(function () {
    
    Paginator = function(){ 
       
        var nItemsPage = 5;
        var nItemsTotal = 100;
        var nPages = Math.ceil(nItemsTotal/nItemsPage);
        var nPagesShown = 10;//Min 3

        //Init the variables from an external call
        var initVars = function(_nItemsPage, _nItemsTotal, _nPagesShown){
            nItemsPage = _nItemsPage || nItemsPage;
            nItemsTotal = _nItemsTotal || nItemsTotal;
            nPages = Math.ceil(nItemsTotal/nItemsPage);
            nPagesShown = _nPagesShown || nPagesShown;

            if(nPagesShown>nPages)
              nPagesShown = nPages;      
        };

        //Init the Paginator Asynchronously
        var _init = function(_nItemsPage, _nItemsTotal, _nPagesShown, current){
            current = typeof current === 'number' ?  current : 1;
            initVars(_nItemsPage, _nItemsTotal, _nPagesShown);

            if(nPagesShown>1)
                createPageLinks(nPages, current, nPagesShown);
            else
                removePaginator();     
        };

        //Updates the total page and current counter
        var updatePageCounter = function(current, nPages){
            $(".page-counter").html(current+' of '+nPages + ((nPages==1) ?' Page':' Pages'));
        };

        //Removes the content of the paginator
        var removePaginator = function(){
            $('.wrapper-paginator').empty();
        };
        
        //Creates the main layout
        var createPageLinks = function(nPages, current, maxPagesShown){
            maxPagesShown = typeof maxPagesShown === 'number' ?  maxPagesShown : nPages;
            last = typeof last === 'number' ?  last : false;

            if(maxPagesShown > nPages)
                maxPagesShown = nPages; 

            // 1º.- Removes the previous content if exists
            removePaginator();

            // 2º.- Insert main containers
            $('.wrapper-paginator').append("<div class='page-counter'></div>");
            $('.wrapper-paginator').append("<div class='page-navigation'></div>");

            // 3º.- Insert Prev Controls
            $('.page-navigation').prepend('<div class="page-selector" style="display:none"><a class="prev-action" href="#">&lsaquo;</a></div>');
            $('.page-navigation').prepend('<div class="page-selector" style="display:none"><a class="first-action"href="#">&laquo;</a></div>');    

            // 4º.- Insert Link Pages
            var initIndex = Math.floor(current/maxPagesShown)* maxPagesShown + 1;
            var endIndex = initIndex + maxPagesShown -1 ;
            var currentIndex = initIndex;

            while(endIndex >= currentIndex)
            {
                var $newLink = $('<div class="page-selector"><a class="page-action" href="#" data-link-index="'+currentIndex+'" data-index="' + currentIndex +'">'+ currentIndex +'</a></div>').appendTo('.page-navigation');
                
                if(currentIndex == initIndex)
                    $newLink.children('.page-action').addClass('first-link');
                
                if(currentIndex == endIndex)
                    $newLink.children('.page-action').addClass('last-link');

                currentIndex++;
            }

            // 5º.- Mark current link Page
            $('.page-navigation .page-selector .page-action[data-index="'+current+'"]').addClass('current-page');

            // 6º.- Insert Next Controls
            $('.page-navigation').append('<div class="page-selector" '+((nPages==1) ? 'style="display:none"' : '')+'><a class="next-action" href="#">&rsaquo;</a></div>');
            $('.page-navigation').append('<div class="page-selector" '+(((nPages==1) || (nPages <= maxPagesShown))?'style="display:none"':'')+'><a class="last-action" href="#">&raquo;</a></div>');

            // 7º.- Update page counter
            updatePageCounter(current, nPages);

            // 8º.- Bind the event to all nodes
            $('.page-navigation .page-selector a').click(function(event){
                event.preventDefault();
                var $newPageLink = $(event.currentTarget);
                clickActionLink($newPageLink);
            }); 
        };  

        //Updates the data of the page links whether it would be necessary
        var managePageLinks = function(nPages, newPage, maxPagesShown){
            maxPagesShown = typeof maxPagesShown === 'number' ?  ((maxPagesShown < nPages) ? maxPagesShown : nPages) : nPages;
            last = typeof last === 'number' ?  last : false;

            $newPageLink = $('.page-navigation .page-selector .page-action[data-index="'+newPage+'"]');
        
            // 1º Check conditions to update the data of PageLinks
            //$newPageLink.length==0 => Page is not on the current PageLinks Layout, (first or last action released)
            if ($newPageLink.hasClass('first-link') || $newPageLink.hasClass('last-link') || $newPageLink.length === 0)
            {
                var newRange = [];

                if ($newPageLink.hasClass('first-link')) //First link of the current link page range clicked
                {   
                    if (($newPageLink.data('link-index') !== $newPageLink.attr('data-index')))
                    {   
                        newRange = [Number($newPageLink.attr('data-index') - maxPagesShown + 2), Number($newPageLink.attr('data-index'))-1];
                        if(newRange[0] < 1)
                            newRange = [1, maxPagesShown];  

                    }   
                }
                else if ($newPageLink.hasClass('last-link')) //Last link of the current link page range clicked
                {   
                    if ($newPageLink.attr('data-index') !== nPages)
                    {   
                        newRange = [Number($newPageLink.attr('data-index')) -1, Number($newPageLink.attr('data-index')) + maxPagesShown - 2];
                        if(newRange[1] > nPages)
                            newRange = [nPages - maxPagesShown+1, nPages];  
                    }   
                }
                else //($newPageLink.length==0) => 'First' or 'Last'  clicked and released
                {   
                    if (newPage == 1)   
                        newRange = [1, maxPagesShown];
                    else if (newPage == nPages)
                        newRange = [nPages - maxPagesShown+1, nPages];
                }       

                //2º The data of the pageLinks is going to be updated
                if (newRange.length==2)
                {
                    var currentIndex = newRange[0]; 
                    var endIndex = newRange[1];

                    $newPageLink.removeClass('current-page');   

                    for (var i=1; i<=maxPagesShown;i++)
                    {
                        var $nodeLink = $('.page-navigation .page-selector .page-action[data-link-index="'+i+'"]');

                        //Modify the required data
                        $nodeLink.attr('data-index', String(currentIndex));
                        $nodeLink.html(currentIndex);

                        if(currentIndex === newPage){
                            $nodeLink.addClass("current-page");
                        }

                        currentIndex++;
                    }
                }               
            }   
        };

        //Manage visiblity and layout access to controls First/Prev/Next/Last button actions
        var manageControls = function(newPage, nPages, nPagesShown){
            //1º Manage left control (Prev)
            $('.page-navigation .page-selector').children('.prev-action').parent().css('display', (newPage != 1) ? 'inline':'none');
            //2º Manage right controls (Next)
            $('.page-navigation .page-selector').children('.next-action').parent().css('display', (newPage != nPages) ? 'inline':'none');

            var newRange = getShownRange();
            if(newRange)
            {
                //3º Manage left control (First)
                $('.page-navigation .page-selector').children('.first-action').parent().css('display', (newRange[0] != 1) ? 'inline':'none');
                //4º Manage right control (Last)
                $('.page-navigation .page-selector').children('.last-action').parent().css('display', (newRange[1] < nPages) ? 'inline':'none');
            }  
        };

        //Retrieves the current range of Pages Links shown
        var getShownRange = function(){
            var init = $('.page-navigation .page-selector .first-link').attr('data-index');
            var end = $('.page-navigation .page-selector .last-link').attr('data-index');

            if (init && end)
                return [Number(init),Number(end)];

            return false;
        };

        //Updates the Layout and data of the PageLinks and Controls
        var updateLayout = function(newPage, oldPage){
            var layoutPagesMod = false;
            var range = getShownRange();

            if(range)
                if( (newPage <= range[0]) || (newPage >=range[1]))
                {   
                    managePageLinks(nPages, newPage, nPagesShown);  
                    layoutPagesMod = true;
                }       
            
            manageControls(newPage, nPages, nPagesShown);

            return layoutPagesMod;
        };

        
        //Manage action click on 'prev'
        var prevPage = function($oldPageLink){
            var oldPage = parseInt($oldPageLink.attr('data-index'));
            
            $oldPageLink.removeClass('current-page');
            var layoutPagesMod = updateLayout(oldPage-1, oldPage);
            
            if(!layoutPagesMod)
                $oldPageLink.parent().prev().children('.page-action').addClass('current-page');

            return oldPage - 1;
        };

        //Manage action click on 'next'
        var nextPage = function($oldPageLink){
            var oldPage = parseInt($oldPageLink.attr('data-index'));

            $oldPageLink.removeClass('current-page');
            var layoutPagesMod = updateLayout(oldPage + 1, oldPage);

            if(!layoutPagesMod)
                $oldPageLink.parent().next().children('.page-action').addClass('current-page');
            
            return oldPage + 1;
        };

        //Manage action click on 'first'
        var firstPage = function($oldPageLink){
            var $newPageLink = $('.page-navigation .page-selector .page-action[data-index="'+1+'"]').first();
            var oldPage = $oldPageLink.attr('data-index');
            
            $oldPageLink.removeClass('current-page');
            var layoutPagesMod = updateLayout(1, oldPage);
            
            if(!layoutPagesMod)
                $newPageLink.addClass('current-page');
            
            return 1;   
        };

        //Manage action click on 'last'
        var lastPage = function($oldPageLink){
            var $newPageLink = $('.page-navigation .page-selector .page-action[data-index="'+nPages+'"]').first();
            var oldPage = $oldPageLink.attr('data-index');
            
            $oldPageLink.removeClass('current-page');
            var layoutPagesMod = updateLayout(nPages, oldPage);
            
            if(!layoutPagesMod)
                $newPageLink.addClass('current-page');

            return nPages;          
        };

        //Manage the action click on a PageLink
        var linkPage = function($oldPageLink, $newPageLink){
            var newPage = $newPageLink.attr('data-index');
            var oldPage = $oldPageLink.attr('data-index');

            var layoutPagesMod = updateLayout(newPage, oldPage);
            
            if(!layoutPagesMod)
                $newPageLink.addClass('current-page');

            return newPage; 
        };

        //Handles each action selected
        var manageNewAction = function($newPageLink, $oldPageLink, action){
            var newPage;
            switch(action)
            {
                case 'page':
                    return linkPage($oldPageLink, $newPageLink);
                case 'next':
                    return nextPage($oldPageLink);
                case 'prev':
                    return prevPage($oldPageLink);
                case 'first':
                    return firstPage($oldPageLink);
                case 'last':
                    return lastPage($oldPageLink);
                default:
                    return false;
            }   
        };

        //Treats any action attached to the links created on the layout
        var clickActionLink = function($newPageLink){
            var $oldPageLink = $('.page-navigation .page-selector .page-action.current-page').first();
                
            if($oldPageLink !== $newPageLink)
            {   
                var $regex = /(\w+)(-action)/ ;//{'page','next','prev','first','last'}
                if ($regex.test($newPageLink[0].className)) 
                {
                    var action = $regex.exec($newPageLink[0].className)[1];
                    var actionList = ['page','next','prev','first','last'];
                    
                    if( $.inArray(action, actionList) !==- 1)
                    {   
                        $oldPageLink.removeClass('current-page');
                        var newPage = manageNewAction($newPageLink, $oldPageLink, action);

                        if(newPage)
                        {    
                            $(".wrapper-paginator").attr("data-page", Number(newPage));
                            $(".wrapper-paginator").trigger('change');
                            updatePageCounter(newPage, nPages); 
                        }    
                    }   
                }
            }
        };

        return {
            init : _init,
            removePaginator : removePaginator     
        };  
    };
}());

 //When the DOM has been created, create the links inside the container properly
$(document).ready(function(){
    if (($('.wrapper-paginator').is('*')) && ($('.wrapper-paginator').data('isAsync') !==true))
    {    
        var _pag = new Paginator();
        _pag.init();/*Use default variables*/
    }    
    
});