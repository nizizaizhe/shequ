"use strict";
require.config({
    baseUrl: 'js',
    paths: {
        'Zepto':['//g.alicdn.com/sj/lib/zepto/zepto.min','lib/Zepto.min'],
        'touch':'lib/touch',
        'sm':['//g.alicdn.com/msui/sm/0.6.2/js/sm.min','lib/sm.min'],
        'template': 'lib/template.min',
        'config':'lib/config'
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

require(['Zepto','template','sm','config','touch'], function($,template) {
    $(".loginback").tap(function(){
        window.history.go(-1);
    });
    $(function() {
        var M = {
            puburl: localStorage.getItem("puburl"),
            verifyCode: "",
            phone: "",
            init: function(){
                this.bk();
            },
            bk:function(){
                var _this = this;
                
                $(".reg-passlogin").tap(function(){
                  location.href="login.html";
                });
                $(".lg-forget").tap(function(){
                  location.href="forgetPass.html";
                });
                $("#lg-phones").focus(function(){
                   $(this).next().removeclass("hide");
                })
                $("#lg-phones").blur(function(){
                   $(this).next().addclass("hide");
                });
                $("lg-cha").tap(function(){
                   $("#lg-phones").val("");
                })
                //验证码
                $(".lg-code").tap(function(){
                   var phone = $("#lg-phones").val().replace(/\s+/g,"");
                    if(phone.length==11){
          
                    }else{
                      $("body").dalutoast("手机号码格式错误");
                      return false;
                    }
                   var url = M.puburl+'/app/memberInfo/sendVerifyCode';
                   var phone = $("#lg-phones").val().replace(/\s+/g,"");
                   var datastr = {phone:phone,pageValue:'ZC'};
                   M.req(url,datastr,'verify');       
                });
                //下一步
                $(".lg-btn").tap(function(){
                    if($(this).text()=="下一步"){
                        var phone = $("#lg-phones").val().replace(/\s+/g,"");
                        var verify = $(".lg-yzCode").val().replace(/\s+/g,"");
                        M.phone = phone;
                        M.verifyCode = verify;
                        if(phone.length==11){
              
                        }else{
                          $("body").dalutoast("手机号码格式错误");
                          return false;
                        }
                        if(verify.length==0){
                          $("body").dalutoast("验证码不能为空");
                          return false;
                        }
                        var url = M.puburl+'/app/memberInfo/register';
                        var datastr = {verifyCode:M.verifyCode,phone:M.phone};
                        M.req(url,datastr,'reg');
                    }else if($(this).text()=="完成"){
                        var nicheng = $(".lg-nicheng").val().replace(/\s+/g,"");
                        var sex = $(".lg-sex").val().replace(/\s+/g,"");
                        var passone = $(".lg-passs1").val().replace(/\s+/g,"");
                        var passtwo = $(".lg-passs2").val().replace(/\s+/g,"");
                        if(nicheng.length==0){
                          $("body").dalutoast("昵称不能为空");
                          return false;
                        }
                        if(sex.length==0){
                          $("body").dalutoast("性别不能为空");
                          return false;
                        }
                        if(passone.length==0){
                          $("body").dalutoast("设置密码不能为空");
                          return false;
                        }
                        if(passtwo.length==0){
                          $("body").dalutoast("确认密码不能为空");
                          return false;
                        }
                        if(passone != passtwo){
                            $("body").dalutoast("输入的密码不一致");
                            return false;
                        }
                        if(sex=="男"){
                            sex = "1";
                        }else{
                            sex = "2";
                        }
                        var url = M.puburl+'/app/memberInfo/updateMemberInfo';
                        var datastr = {memberId:localStorage.getItem("memberId"),name:nicheng,firstPassword:passone,
                        secondPassword:passtwo,sex:sex};
                        M.req(url,datastr,"wanshan");   
                    }
                })
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
                        if(typestr == "verify"){
                            M.handle(data,typestr);
                        }else if(typestr == "reg"){
                            M.handle(data,typestr);
                        }else if(typestr == "wanshan"){
                            M.handle(data,typestr);
                        }
                      },
                      error: function(xhr, type){
                        $("body").dalutoast('服务器开小差了～')
                        return false;
                      }
                })
            },
            handle:function(data,typestr){
                if(typestr == "verify"){
                  
                }else if(typestr == "reg"){  
                    if(data.code == 0){
                        var param = {memberid:data.data.id.toString(), userid:"",token:data.data.token.toString(),usertype:""};
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
                            $(".lg-shouji").addClass("hide");
                            $(".lg-Verification").addClass("hide");
                            $(".rg-information").removeClass("hide");
                            $(".lg-btn").text("完成");
                            $(".fg-step img").attr("src","images/w@2x.png");
                        });
                    } else if(data.code == -22) {
                          $.modal({
                              title:  '',
                              text: '该手机号已注册，您是选择更换号码还是直接登陆？',
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
                        $("body").dalutoast(data.message)
                    };
                }else if(typestr == "wanshan"){
                    var fromPage = sessionStorage.getItem('fromPage');
                    if(fromPage == "compose"){
                        M.callClose();
                    }else{
                       M.toHome();
                    }   
                }
            },
            callClose: function() {
              var _this = this;
                  dsBridge.call("compose.closeComposeControllerFromJS","compose.closeComposeControllerFromJS",function(data){
                            
                                });
                _this.toHome();                
              },
            toHome:function () {
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