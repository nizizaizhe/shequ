
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
        var articleFlag = "0";
        var replyFlag = "0";
        var commentFlag = "0";
        var M = {
            puburl: localStorage.getItem("puburl"),
            memberId:localStorage.getItem("memberId"),
            init: function(){
                var url = M.puburl+"/app/message/findByMemberId?memberId="+this.memberId;
                var data = {memberId:M.memberId};
                this.req(url,data);
            },
            bk:function(){
               $(".checkbox.set-labelh13").tap(function(){
                   var ischeched = $(this).prev().prop('checked');
                   var id = $(this).prev().attr("id");
                   if(id=="tiezi"){
                      if(ischeched){
                         articleFlag = "1";
                      }else{
                        articleFlag = "0";
                      }
                   }else if(id=="huitie"){
                      if(ischeched){
                         replyFlag = "1";
                      }else{
                        replyFlag = "0";
                      }
                   }else if(id=="pinglun"){
                      if(ischeched){
                         commentFlag = "1";
                      }else{
                        commentFlag = "0";
                      }
                   }
                   var url = M.puburl+"/app/message/update";
                   var datastr = {memberId:M.memberId,articleFlag:articleFlag,replyFlag:replyFlag,commentFlag:commentFlag}
                   $.ajax({
                          type: 'post',
                          url: url,
                          data:datastr,
                          dataType: 'json',
                          timeout: 6000,
                          success: function(data){
                            console.log(data);
                            if(data.code == 0) {
                                _this.handle(data);
                                $.toast("设置成功");
                            }
                          },
                          error: function(xhr, type){
                             $("body").dalutoast('服务器开小差了～')
                             return false;
                          }
                   })
               })
            },
            req: function(url,datastr){
                var _this = this;
                $.ajax({
                      type: 'get',
                      url: url,
                      // data:datastr,
                      dataType: 'json',
                      timeout: 6000,
                      success: function(data){
                        console.log(data);
                        if(data.code == 0&&data.data.length!=0) {
                            _this.handle(data);
                        }
                      },
                      error: function(xhr, type){
                         $("body").dalutoast('服务器开小差了～')
                        return false;
                      }
                })
            },
            handle:function(data){
                var html = template("setTpl",data);
                $("#set").html(html);
                if(data.data.articleFlag == 1){
                    $("#tiezi").prop('checked',true);
                    articleFlag = "1";
                }
                if(data.data.replyFlag == 1){
                    $("#huitie").prop('checked',true);
                    replyFlag = "1";
                }
                if(data.data.commentFlag == 1){
                    $("#pinglun").prop('checked',true);
                    commentFlag = "1";
                }
                this.bk();
            }
            
        }
        M.init();
        $.init();
    })
})
