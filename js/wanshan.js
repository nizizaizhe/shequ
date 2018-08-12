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
    $(".backdiv").click(function(){
        window.history.go(-1);
     });
    $(function() {
        var M = {
            puburl: localStorage.getItem("puburl"),
            name: "",
            firstPassword: "",
            secondPassword: "",
            sex: "1",
            init: function(){
                this.bk();
            },
            bk:function(){
                var _this = this;
                //完成
                $("#wanshan-ok").tap(function(){
                     var url = _this.puburl+'/app/memberInfo/updateMemberInfo';
                     _this.name = $(".wanshan-nic").val();
                     _this.firstPassword = $(".wanshan-passone").val();
                     _this.secondPassword = $(".wanshan-passtwo").val(); 
                     _this.sex = $(".wanshan-select").val()=="male" ? "1":"2"; 
                     var datastr = {memberId:localStorage.getItem("memberId"),name:_this.name,firstPassword:_this.firstPassword,
                      secondPassword:_this.secondPassword,sex:_this.sex};
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
                      timeout: 3000,
                      success: function(data){
                        console.log(data);
                        data.code == 0 ? _this.handle(data): $.toast(data.message);
                      },
                      error: function(xhr, type){
                          $.toast('服务器开小差了～');
                          return false;
                      }
                })
            },
            handle:function(data){
             // alert(JSON.stringify(data));
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
