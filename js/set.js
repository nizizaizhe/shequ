"use strict";
require.config({
       baseUrl: 'js',
       paths: {
       'Zepto':['lib/Zepto.min'],
       'touch':'lib/touch',
       'ani':'lib/animate',
       'sm':['lib/sm'],
       'config':'lib/config',
       'template': 'lib/template.min',
       'dsBridge':"lib/dsbridge"
       },
       shim: {
       'Zepto':{exports:'Zepto'},
       'touch':{deps:['Zepto']},
       'config':{deps:['Zepto']},
       'ani':{deps:['Zepto']},
       'sm':{
       deps: ['Zepto']
       }
       }
});
require(['Zepto','template','sm','touch','ani','config','dsBridge'], function($,template) {
    $(".backdiv").tap(function(){
        window.history.go(-1);
     })
    $(function() {
        var M = {
            puburl: localStorage.getItem("puburl"),
            init: function(){
                this.bk();
            },
            bk:function(){
               var _this = this;          
               $(".quittxt").tap(function(){// 退出登录
                   var url = _this.puburl+'/app/memberInfo/logout';
                   var datastr = {memberId:localStorage.getItem("memberId"),deviceNo:localStorage.getItem("deviceNo")};
                   _this.req(url,datastr);
               });
            },
            req: function(url,datastr){
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
            handle:function(data){//退出登录
              //alert(JSON.stringify(data));
                var fromPage = sessionStorage.getItem('fromPage');
                var param = {memberid:data.data.id.toString(),token:"",usertype:""};
                dsBridge.call(fromPage+".getUserInfo",param,function(data){
                  //alert(JSON.stringify(data));
                    if(data.memberid==""||data.memberid==null||data.memberid=="null"||data.memberid==undefined||data.memberid=="undefined"){
                        data.memberid = "";
                    }
                    if(data.token==""||data.token==null||data.token=="null"||data.token==undefined||data.token=="undefined"){
                        data.token="";
                    }
                    localStorage.setItem('memberId',data.memberid);
                    localStorage.setItem('token',data.token);
                    M.toHome();
                });
            },
            toHome:function () {//刷新指定页面：此处好像只有me有效果
                dsBridge.call("home.reloadHtmlFromJS","home.reloadHtmlFromJS",function(data){

                });
                dsBridge.call("me.reloadHtmlFromJS","me.reloadHtmlFromJS",function(data){
                });


                dsBridge.call("quanzi.reloadHtmlFromJS","quanzi.reloadHtmlFromJS",function(data){

                });

                dsBridge.call("video.reloadHtmlFromJS","video.reloadHtmlFromJS",function(data){

                });
            }
        };
        
        M.init();
        $.init();
    });
})
    
