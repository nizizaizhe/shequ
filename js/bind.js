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
     });
    $(function() {
        var M = {
            puburl: sessionStorage.getItem("puburl"),
            userId: localStorage.userId,
            verifyCode: "",
            phone: "",
            init: function(){
                this.bk();
            },
            bk:function(){
                var _this = this;
                //验证码
                $("#reg-verifyCode").tap(function(){
                     var url = _this.puburl+'/app/memberInfo/sendVerifyCode';
                     _this.phone = $(".reg-phone").val();  
                     var datastr = {userId:_this.userId,phone:_this.phone,pageValue:'BD'};
                     _this.req(url,datastr,'verify');       
                });
                //在绑定
                $("#reg-regCode").tap(function(){
                     var url = _this.puburl+'/app/memberInfo/register';
                     _this.verifyCode = $(".reg-verify").val();
                     _this.phone = $(".reg-phone").val();  
                     var datastr = {userId:_this.userId,verifyCode:_this.verifyCode,phone:_this.phone,pageValue:"BD"};
                     _this.req(url,datastr,'bd');       
                });
            },
            req: function(url,datastr,typestr){
                var _this = this;
                $.ajax({
                      type: 'post',
                      url: url,
                      data:datastr,
                      dataType: 'json',
                      timeout: 3000,
                      success: function(data){
                        console.log(data);
                        if(data.code == 0){
                          _this.handle(data,typestr)
                        } else if(data.code == -23) {
                            $.modal({
                                title:  '',
                                text: '该手机号已绑定，您是选择更换号码还是直接登陆？',
                                buttons: [
                                  {
                                    text: '更换号码',
                                    onClick: function() {
                                      
                                    }
                                  },
                                  {
                                    text: '直接登陆',
                                    onClick: function() {
                                       window.location.href="login.html";
                                    }
                                  }
                                ]
                              });
                        }else{
                          $.toast(data.message)
                        };
                       
                      },
                      error: function(xhr, type){
                        $("body").dalutoast('服务器开小差了～')
                        return false;
                      }
                })
            },
            handle:function(data,typestr){
                if(typestr == "verify"){
                   /*alert("verify ok!");*/
                }else if(typestr == "bd"){
                  if(data.code == 0){
                      var fromPage = sessionStorage.getItem('fromPage');
                      var param = {memberid:data.data.id.toString(), userid:data.data.userId.toString(),token:data.data.token.toString(),usertype:""};
                        dsBridge.call(fromPage+".getUserInfo",param,function(data){
                            if(data.memberid==""||data.memberid==null||data.memberid=="null"||data.memberid==undefined||data.memberid=="undefined"){
                                data.memberid = "";
                            }
                            if(data.userId==""||data.userId==null||data.userId=="null"||data.userId==undefined||data.userId=="undefined"){
                                data.userId="";
                            }
                            if(data.token==""||data.token==null||data.token=="null"||data.token==undefined||data.token=="undefined"){
                                data.token="";
                            }
                            localStorage.setItem('memberId',data.memberid);
                            localStorage.setItem('userId',data.userId);
                            localStorage.setItem('token',data.token);
                            if(fromPage == "compose"){
                                M.callClose();
                            }else{
                               M.toHome();
                            }
                        });
                  }
                    window.location.href = "wanshan.html";
                }
            },
            callClose: function() {
                var _this = this;
                    dsBridge.call("compose.closeComposeControllerFromJS",function(data){ });
                    M.toHome();
                },
            toHome:function () {
                //客户端：reload指定页
                    dsBridge.call("home.reloadHtmlFromJS","home.reloadHtmlFromJS",function(data){

                    });

                    dsBridge.call("quanzi.reloadHtmlFromJS","quanzi.reloadHtmlFromJS",function(data){

                    });

                    dsBridge.call("video.reloadHtmlFromJS","video.reloadHtmlFromJS",function(data){

                    });

                    dsBridge.call("me.reloadHtmlFromJS","me.reloadHtmlFromJS",function(data){

                    });
            } 
        };
        
        M.init();
        $.init();
    });
})
