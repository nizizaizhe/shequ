
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
require(['Zepto','template','touch','ani',,'sm','config','dsBridge'], function($,template) {
    $(".loginback").tap(function(){
        window.history.go(-1);
    });
    
    var islocal = 0;//0是浏览器调试，1 是手机端调试
    $(function() {
        var M = {
            puburl: localStorage.getItem("puburl"),
            init: function(){
                this.bk();
            },
            getQueryString:function (name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                var r = window.location.search.substr(1).match(reg);
                if (r != null) return unescape(r[2]); return null;
            },
            bk:function(){
                var _this = this;
                $(".lg-forget").tap(function(){
                  location.href="forgetPass.html";
                });
                $(".lg-regist").tap(function(){
                  location.href="reg.html";
                });
                //密码登录开始
                $(".lg-phones").focus(function(){
                    $(this).next().removeClass("hide");
                    $(".lg-btn").removeClass("lg-error").text("登录");
                });
                $(".lg-phones").blur(function(){
                    $(this).next().addClass("hide");
                    $(".lg-btn").removeClass("lg-error").text("登录");
                });
                $(".lg-cha").tap(function(){
                    $(".lg-phones").val("");
                });
                //password
                $(".lg-passs").focus(function(){
                    $(this).next().removeClass("hide");
                    $(".lg-btn").removeClass("lg-error").text("登录");
                });
                $(".lg-passs").blur(function(){
                    $(this).next().addClass("hide");
                });
                $(".lg-chas").tap(function(){
                    $(".lg-passs").val("");
                });
                //完成
                $(".lg-btn").tap(function(){
                    var phone = $(".lg-phones").val().replace(/\s+/g,"");
                    var password = $(".lg-passs").val().replace(/\s+/g,"");
                    if(phone.length==11){
          
                    }else{
                      $(".lg-btn").addClass("lg-error").text("手机号码格式错误");
                      return false;
                    }
                     var url = _this.puburl+'/app/memberInfo/userLogin';
                     var datastr = {phone:phone,password:password};
                     _this.req(url,datastr,'passlogin');       
                });
                //密码登录结束
                //切换验证码和密码登录开始
                $(".lg-phoneverification").tap(function(){
                    if($(this).text()=="手机验证登录"){
                      $(this).text("密码登录");
                      $(".pwdlogin").text("手机登录");
                      $(".lg-btn").removeClass("lg-error").text("登录");
                      $(".lg-mimadenglu").addClass("hide");
                      $(".lg-Verification").removeClass("hide");
                      $(".lg-phones").val("");
                      $(".g-yzCode").val("");
                    }else{
                      $(this).text("手机验证登录");
                      $(".pwdlogin").text("密码登录");
                      $(".lg-btn").removeClass("lg-error").text("登录");
                      $(".lg-mimadenglu").removeClass("hide");
                      $(".lg-Verification").addClass("hide");
                      $(".lg-phones").val("");
                      $(".lg-passs").val("");
                    }
                })
                //切换验证码和密码登录结束
                //验证码获取开始
                $(".lg-code").tap(function(){
                   var url = M.puburl+'/app/memberInfo/sendVerifyCode';
                   var phone = $(".lg-phones").val().replace(/\s+/g,"");  
                   var datastr = {phone:phone,pageValue:'DL'};
                   M.req(url,datastr,'verify');       
                });
                //验证码获取结束
                //验证码登录开始
                $(".lg-yzCode").focus(function(){
                    $(".lg-btn").removeClass("lg-error").text("登录");
                });
                //完成
                $(".lg-btn").tap(function(){
                    var phone = $(".lg-phones").val().replace(/\s+/g,"");
                    var verifyCode = $(".lg-yzCode").val().replace(/\s+/g,"");
                    if(phone.length==11){
          
                    }else{
                      $(".lg-btn").addClass("lg-error").text("手机号码格式错误");
                      return false;
                    }
                     var url = _this.puburl+'/app/memberInfo/verifyCodeLogin';
                     var datastr = {verifyCode:verifyCode,phone:phone};
                     _this.req(url,datastr,'phonelogin');       
                });
                //验证码登录结束
            },

            req: function(url,datastr,typestr){
                var _this = this;
                $.ajax({
                      type: 'post',
                      url: url,
                      data:datastr,

                      dataType: 'json',
                      timeout: 6000,
                      success: function(data){
                          //alert('login huidiao'+JSON.stringify(data));
                        if(typestr == "passlogin" || typestr == "phonelogin"){
                            if(data.code == 0) {
                                $(".lg-shuru").remove();
                                $(".lg-btn").addClass("opc0");
                                $(".lg-phoneverification").addClass("opc0");
                                $(".lg-welcome").removeClass("hide");
                                var t = setTimeout(function(){
                                   _this.handle(data);
                                   clearTimeout(t);
                                },1000)
                            }else if(data.code == -2){
                                $(".lg-btn").addClass("lg-error").text("密码错误");
                            }else{
                                $("body").dalutoast(data.message);
                            }
                        }else if(typestr == "verify"){
                            
                        }
                      },
                      error: function(xhr, type){
                       $("body").dalutoast('服务器开小差了～')
                       return false;
                      }
                })
            },
            handle:function(data){//登录
              if(islocal == 0){
                localStorage.setItem('memberId',data.data.id);
                localStorage.setItem('token',data.data.token);
              }else{ 
                  var fromPage = sessionStorage.getItem('fromPage');
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
                        if(fromPage == "compose"){
                            M.callClose();
                        }else{
                           M.toHome();
                        }
                    });
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
