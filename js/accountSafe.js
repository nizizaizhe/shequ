"use strict";
require.config({
    baseUrl: 'js',
    paths: {
        'Zepto':['//g.alicdn.com/sj/lib/zepto/zepto.min','lib/Zepto.min'],
        'touch':'lib/touch',
        'sm':['//g.alicdn.com/msui/sm/0.6.2/js/sm.min','lib/sm.min'],
        'template': 'lib/template.min',
        'config':'lib/config',
        'dsBridge':"lib/dsbridge"
    },
    shim: {
        'Zepto':{exports:'Zepto'},
        'touch':{deps:['Zepto']},
        'sm':{
            deps: ['Zepto']
        },
        'config':{deps:['Zepto']}
    }
});

require(['Zepto','template','sm','config','touch','dsBridge'], function($,template) {
   $(".backdiv").tap(function(){
        window.history.go(-1);
    })
    $(function() {
       // alert('person init localStorage'+JSON.stringify(localStorage));
        var picurl = sessionStorage.getItem("picurl");
        var M = {
              puburl:sessionStorage.getItem("puburl"),
              memberId:localStorage.getItem('memberId'),
              tokenId:localStorage.getItem('token') || null,
            init: function(){
                var url = M.puburl+'/app/memberInfo/member';
                var datastr = {memberId:this.memberId};
                this.req(url,datastr);
            },
            bk:function(){// init click
               var _this = this;
            },
            req: function(url,datastr){//获取userinfo
                var _this = this;
                $.ajax({
                      type: 'post',
                      url: url,
                      data:datastr,
                      dataType: 'json',
                      timeout: 6000,
                      success: function(data){
                        console.log(data);
                        _this.handle(data);
                      },
                      error: function(xhr, type){
                        $("body").dalutoast('服务器开小差了～')
                        return false;
                      }
                })
            },
            handle:function(data){
               $(".phonenum").text(data.data.phone)
            },
        };
      M.init();
      $.init();
    });
})
   
        
