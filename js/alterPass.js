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
    $(".backdiv").tap(function(){
        window.history.go(-1);
     });
    $(function() {
        var M = {
            puburl: localStorage.getItem("puburl"),
            memberId: localStorage.memberId,
            verifyCode: "",
            phone: "",
            oldpass:"",
            pass1:"",
            pass2:"",
            init: function(){
                this.bk();
            },
            bk:function(){
                var _this = this;
                //验证码
                $("#fp-verifyCode").tap(function(){
                     var url = _this.puburl+'/app/memberInfo/sendVerifyCode';
                     _this.phone = $(".fp-phone").val();  
                     var datastr = {phone:_this.phone,pageValue:'WJMM'};
                     _this.req(url,datastr,'verify');       
                });
                //重置
                $("#fp-chongzhi").tap(function(){
                     var url = _this.puburl+'/app/memberInfo/update';
                     _this.verifyCode = $(".fp-verify").val();
                     _this.phone = $(".fp-phone").val();
                     _this.oldpass = $(".fp-pass0").val();
                     _this.pass1 = $(".fp-pass1").val();
                     _this.pass2 = $(".fp-pass2").val();
                     var datastr = {memberId:_this.memberId,
                        oldPassword:_this.oldpass,newPassword:_this.pass1,confirmPassword:_this.pass2};
                     _this.req(url,datastr,'reset');       
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
                        data.code == 0 ? _this.handle(data,typestr): $.toast(data.message);
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
                }else if(typestr == "reset"){  
                    window.location.href = "login.html";
                }
            }
        };
        
        M.init();
        $.init();
    });
})