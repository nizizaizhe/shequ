"use strict";
require.config({
    baseUrl: 'js',
    paths: {
        'Zepto':'lib/Zepto.min',
        'touch':'lib/touch',
        'sm':'lib/sm',
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
     })
    template.helper('getPicture',function(str){
      var arr=str.split(";");
      return arr[0];
    });
    $(function() {
      $.config = {router: false}
        var M = {
            puburl: localStorage.getItem("puburl"),
            picurl: localStorage.getItem("picurl"),
            memberId:localStorage.memberId,
            pageSize:10,
            pageNo:1,
            init: function(){
                this.bk();
                var url = this.puburl+"/app/browse/list?memberId="+this.memberId+"&pageNo="+this.pageNo+"&pageSize="+this.pageSize;
                this.req(url);
            },
            req: function(url){
                var _this = this;
                $.ajax({
                      type: 'get',
                      url: url,
                      dataType: 'json',
                      timeout: 3000,
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
                if(data.code == 0&&data.data.length>0){
                    data.picurl = M.picurl;
                    var html = template("recordTpl",data);
                    $(".content-block").html(html);
                }else{
                  var html = template("withdwkong2-ulTpl2",data);
                    $(".content-block").html(html);
                }
            },
            bk:function(){
              var _this = this;
              $("#recordclear").tap(function(){
                $.confirm('清空所有浏览记录?',
                    function () {
                        $(".modal").remove();
                         $.ajax({
                              type: 'post',
                              url: _this.puburl+"/app/browse/delete",
                              data:{memberId:_this.memberId},
                              dataType: 'json',
                              timeout: 3000,
                              success: function(data){
                                console.log(data);
                                _this.init();
                                $("body").dalutoast("已经清除");
                              },
                              error: function(xhr, type){
                                $("body").dalutoast('服务器开小差了～')
                                return false;
                              }
                        })
                    },
                    function () {
                      $(".modal").remove();
                    }
                );
              })
            }
        };
        
        M.init();
        $.init();
    });
})
    