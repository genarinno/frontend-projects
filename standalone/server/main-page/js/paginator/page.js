/*--------------------------------------------------
:: PAGE
--------------------------------------------------*/
var PageInfo;

var $introExample;

/*--------------------------------------------------
:: MAIN FUNCTIONS
--------------------------------------------------*/
function manageIntroExample(){
	$introExample.on("onPageChange", ".paginator-intro-example", function(ev, page, id){
		var $frameCarousel= $(".box-cont", $introExample),
			$boxCarousel = $(".box-carousel", $introExample),
			nextLeftPos = -($(".box"+ page).position().left);

			console.log($(".box"+ page));
			console.log(nextLeftPos);
		
		//Travel o new card
		$boxCarousel.stop().animate({
        	left: nextLeftPos
    	},"slow");
	});
}

function initNodes(page){
	if(page==="paginator"){
		$introExample = $("#intro-example");
	}
}

function initPage(page, type){
	switch (page){
		case "paginator":
			if(type === "home"){
				initNodes(page);
				manageIntroExample();
			}
			break;
		default:
			console.log("WATER!");
	}
}



/*--------------------------------------------------
:: ENTRY POINT
--------------------------------------------------*/
$(document).ready(function(ev){
	var pageObj;

	PageInfo = JSBUENOS;

	if(PageInfo){
		pageObj = PageInfo.page.split(".");
	}
	else{
		throw "Page values hasn't be created as expected";
	}

	initPage(pageObj[0], pageObj[1]);
	$('pre code').each(function(i, block) {
    	hljs.highlightBlock(block);
	});
});