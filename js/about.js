require.config({
    baseUrl: 'js',
    paths: {
        'Zepto':['lib/Zepto.min'],
        'cg':'lib/config',
        'sm':['lib/sm.min'],
        'template': 'lib/template.min'
    },
    shim: {
        'Zepto':{exports:'Zepto'},
        'cg':{deps:['Zepto']},
        'sm':{
            deps: ['Zepto']
        }
    }
});

require(['Zepto','template','sm','cg'], function($,template) {
    var puburl = localStorage.getItem("puburl");
    var token = localStorage.getItem("HuiLantoken");
    $(".backdiv").click(function(){
        window.history.go(-1);
     })
    $(function(){
        
        $.init();
    });
    
})