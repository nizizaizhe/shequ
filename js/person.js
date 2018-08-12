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
        var picurl = localStorage.getItem("picurl");
        var M = {
              puburl:localStorage.getItem("puburl"),
              userId:"",
              memberId:"",
              tokenId:"",
            init: function(){
              M.userId = localStorage.getItem('userId');
              M.memberId = localStorage.getItem('memberId');
              M.tokenId = localStorage.getItem('token');
              var url = M.puburl+'/app/memberInfo/member';
              var datastr = {memberId:M.memberId};
              //alert(url);
             // alert(JSON.stringify(datastr))
              M.req(url,datastr);
            },
            bk:function(){// init click
              var _this = this;
              var islogin = M.tokenId;
                $(".liji").tap(function(){
                   window.location.href = "login.html";
                })
                //编辑资料
               $("#p-toedit").tap(function(event){
                  if(islogin==""){
                      window.location.href = "login.html";
                  }else{
                      window.location.href = "edit.html?time="+Date();
                      event.preventDefault();
                  }
               });
               //设置
               $(".p-set").tap(function(){
                   if(islogin==""){
                       window.location.href = "login.html";
                    }else{
                        window.location.href = "set.html";                    
                    }
               });
               //关注
               $(".p-concern").tap(function(){
                   if(islogin==""){
                        window.location.href = "login.html";
                    }else{
                        window.location.href = "concern.html";                   
                    }                 
               })
               //发布
               $(".p-release").tap(function(){
                    if(islogin==""){
                        window.location.href = "login.html";
                    }else{
                        window.location.href = "release.html";                  
                    }   
               })
               //收藏
               $(".p-collect").tap(function(){
                    if(islogin==""){
                        window.location.href = "login.html";
                    }else{
                        window.location.href = "collect.html";                
                    }   
               })
               //消息
               $(".p-message").tap(function(){
                    if(islogin==""){
                        window.location.href = "login.html";
                    }else{
                        window.location.href = "message.html";               
                    }   
               })
               //浏览记录
               $(".p-record").tap(function(){
                // -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                    if(islogin==""){
                        window.location.href = "login.html";
                    }else{
                       window.location.href = "record.html";               
                    }          
               })
               //离线下载
               $(".p-offline").tap(function(){
                     $("body").dalutoast("该功能近期开放");
               })
               //意见反馈
               $(".p-fankui").tap(function(){
                    if(islogin==""){
                        window.location.href = "login.html";
                    }else{
                      window.location.href = "fankui.html";             
                    }  
               })
            },
            req: function(url,datastr){//获取userinfo
                var _this = this;
                var deviceNoId=localStorage.getItem('deviceNo');
                $.ajax({
                      type: 'post',
                      url: url,
                      data:datastr,
                      dataType: 'json',
                      timeout: 6000,
                      success: function(data){
                        _this.handle(data);
                      },
                      error: function(xhr, type){
                        $("body").dalutoast('服务器开小差了～')
                        return false;
                      }
                })
            },
            handle:function(data){
              //alert(JSON.stringify(data));
                 data.picurl = picurl;
                 data.data.token = localStorage.getItem("token");
                var html = template("personTpl",data);
                $("#person").html(html);
                this.bk();
            }
        };

       function testInit(i){
           if(i==1){
               dsBridge.call("me.getUserInfo",{},function(data){
                //alert(JSON.stringify(data));
                   if(data.memberid==""||data.memberid==null||data.memberid=="null"||data.memberid==undefined||data.memberid=="undefined"){
                       data.memberid = "";
                   }
                   if(data.token==""||data.token==null||data.token=="null"||data.token==undefined||data.token=="undefined"){
                       data.token="";
                   }
                   localStorage.setItem('memberId',data.memberid);
                   localStorage.setItem('token',data.token);
                   sessionStorage.setItem('fromPage',"me");
                   M.init();
               });
           }else{
               M.init();
           }
       };
        testInit(0);//1 发布  0本地测试
      $.init();
    });
})
   
        
