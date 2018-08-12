


require.config({
    baseUrl: 'js',
    paths: {
        'Zepto':['lib/Zepto.min'],
        'sm':['lib/sm.min'],
        'config': 'lib/config',
        'global': 'lib/global'
    },
    shim: {
        'Zepto':{exports:'Zepto'},
        'config':{deps:['Zepto']},
        'global':{deps:['Zepto']},
        'sm':{
            deps: ['Zepto']
        }
    }
});
require(['Zepto','sm','config','global'], function($,template) {
    var objGlobal={

        ajaxUrl:'http://192.168.0.102:8888',







        init:function () {

        }
    };
    $(function () {
        objGlobal.init()
    })
})


