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
                $(".fg-passlogin").tap(function(){
                  location.href="login.html";
                });
                $(".lg-regist").tap(function(){
                  location.href="reg.html";
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
                   var phone = $(".lg-phones").val().replace(/\s+/g,"");
                    if(phone.length==11){
          
                    }else{
                      $("body").dalutoast("手机号码格式错误");
                      return false;
                    }
                   var url = M.puburl+'/app/memberInfo/sendVerifyCode';
                   var phone = $(".lg-phones").val().replace(/\s+/g,"");
                   var datastr = {phone:phone,pageValue:'WJMM'};
                   M.req(url,datastr,'verify');       
                });
                //下一步
                $(".lg-btn").tap(function(){
                    if($(this).text()=="下一步"){
                        var phone = $(".lg-phones").val().replace(/\s+/g,"");
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
                        $(".lg-shouji").addClass("hide");
                        $(".lg-Verification").addClass("hide");
                        $(".lg-shezhipass").removeClass("hide");
                        $(".lg-querenpass").removeClass("hide");
                        $(".lg-btn").text("完成");
                        $(".fg-step img").attr("src","images/w@2x.png");
                    }else if($(this).text()=="完成"){
                        var passone = $(".lg-passs1").val().replace(/\s+/g,"");
                        var passtwo = $(".lg-passs2").val().replace(/\s+/g,"");
                        if(passone != passtwo){
                            $("body").dalutoast("输入的密码不一致");
                            return false;
                        }
                        var url = M.puburl+'/app/memberInfo/resetPassword';
                        var datastr = {verifyCode:M.verifyCode,phone:M.phone,
                        firstNewPassword:passone,secondNewPassword:passtwo};
                        M.req(url,datastr,'reset'); 
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
                        console.log(data);
                        data.code == 0 ? _this.handle(data,typestr): $("body").dalutoast(data.message);
                      },
                      error: function(xhr, type){
                        $("body").dalutoast("error")
                      }
                })
            },
            handle:function(data,typestr){
                if(typestr == "verify"){
                   /*alert("verify ok!");*/
                }else if(typestr == "reset"){  
                    window.location.href = "login.html";
                }
            }
        };
        
        M.init();
        $.init();
    });
})