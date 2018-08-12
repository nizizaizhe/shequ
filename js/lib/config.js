
// sessionStorage.setItem("pictureUpload", "http://192.168.0.102:8888");
// sessionStorage.setItem("videoUpLoad", "http://192.168.0.102:8888");
//sessionStorage.setItem("geturl", "http://192.168.0.102:8888");//动态获取域名接口地址
//sessionStorage.setItem("geturl", "http://23.234.51.81:8888");
//sessionStorage.setItem("puburl", "http://10.10.30.10:8080"); //david
sessionStorage.setItem("geturl", "http://10.10.30.128:8080")//降龙
//  sessionStorage.setItem("geturl", "http://10.10.30.210:8080"); //鸣人
$.config = {router: false};
// sessionStorage.setItem("puburl", "http://10.10.30.210:8080"); //鸣人
$.config = {router: false}


 $.fn.dalutoast = function(msg) {
    var $dalutoasthtml = $('<div class="dalutoast" style="background: rgba(0,0,0,.8);'+
	    'border-radius: 1rem;'+
	    'color: #fff;'+
	    'padding: 0.2rem .8rem;'+
	    'font-size: .8rem;'+
	    'position: absolute;'+
	    'z-index: 11000;'+
	    'left: 50%;'+
	    'margin-top: 0;'+
	    'top: 40%;'+
	    'text-align: center;'+
	    'border-radius: .35rem;'+
	    '-webkit-transform: translate3d(0,0,0) scale(1.185);'+
	    'transform: translate3d(0,0,0) scale(1.185);'+
	    '-webkit-transform: translateX(-50%);'+
	    'transform: translateX(-50%)"'+
	    '>' +
        msg + '</div>').appendTo(document.body);
        var t = setTimeout(function() {
            $(".dalutoast").remove();
        clearTimeout(t);
    },1000)
 };