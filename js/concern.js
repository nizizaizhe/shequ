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
    })
    $(function() {
        if($.device.osVersion == "10.3.3"){
          $(".content").css("bottom","2.2rem");
        }else{
          $(".content").css("bottom","0");
        }  
        var M = {
            puburl: localStorage.getItem("puburl"),
            picurl: localStorage.getItem("picurl"),
            memberId:localStorage.memberId,
            pageNo:1,
            pageSize:10,
            loading :false,
            init: function(){
                // $.attachInfiniteScroll($('.infinite-scroll'));
                this.reqdata(false);
                this.dropDown();
                this.scroll();
            },
            bk:function(){
               var _this = this;          
               $("li.concern").tap(function(){
                    var id = $(this).attr("data-id");
                    var followFlag = $(this).attr("data-followFlag");
                    var circleName = $(this).attr("data-circleName");
                    window.location.href = "listofCircles.html?id="+id+"&followFlag="+followFlag+"&circleName="+circleName;
                });
            },
            reqdata:function(isscroll){
                var urlFollow = M.puburl+'/app/follow/list';
                var paramFollow = {pageNo:M.pageNo,pageSize:M.pageSize,memberId:M.memberId};
                M.req(urlFollow,paramFollow,isscroll);
            },
            req: function(url,datastr,isscroll){
                var _this = this;
                $.ajax({
                      type: 'post',
                      url: url,
                      data:datastr,
                      dataType: 'json',
                      timeout: 6000,
                      success: function(data){
                        console.log(data);
                        if(isscroll && data.data.length == 0){
                           $.detachInfiniteScroll($('.infinite-scroll'));
                           $(".infinite-scroll-preloader").remove();
                           $(".mypreloader").removeClass("hide");
                        }
                        _this.loading = false;
                        _this.handle(data,isscroll);
                      },
                      error: function(xhr, type){
                        $("body").dalutoast('服务器开小差了～')
                        return false;
                      }
                })
            },
            handle:function(data,isscroll){
               var qzName='';
               $.map(data.data,function (item,index) {
                   data.data[index].qzName=String(encodeURI(item.name));
                   return data.data;
               });
                var _this = this;
                data.picurl = M.picurl;
                if(data.code == 0){
                    if(isscroll){
                        var html = template("guanzhuTpl",data);
                        $(".concern-up").append(html);
                    }else{
                        var html = template("guanzhuTpl",data);
                        $(".concern-up").html(html);
                    }
                    _this.bk();
                }
            },
            // 添加'refresh'监听器下拉刷新
            dropDown: function () {
                $(document).on('refresh', '.pull-to-refresh-content', function (e) {
                    setTimeout(function(){
                        M.pageNo = 1;
                        M.reqdata(false);
                        $.pullToRefreshDone('.pull-to-refresh-content');
                    },1000);
                });
            },
            scroll:function(){
                var _this = this;
                $(document).on('infinite', '.infinite-scroll',function() {
                    if (_this.loading) return;
                    $(".infinite-scroll-preloader").removeClass("hide");
                    M.pageNo++;
                    _this.loading = true;
                    _this.reqdata(true);
                })
            }
        };
        
        M.init();
        $.init();
    });
})