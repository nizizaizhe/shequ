
require.config({
    baseUrl: 'js',
    paths: {
        'Zepto':['lib/Zepto.min'],
        'touch':'lib/touch',
        'ani':'lib/animate',
        'cg':'lib/config',
        'sm':['lib/sm'],
        'template': 'lib/template.min'
    },
    shim: {
        'Zepto':{exports:'Zepto'},
        'touch':{deps:['Zepto']},
        'ani':{deps:['Zepto']},
        'cg':{deps:['Zepto']},
        'sm':{
            deps: ['Zepto']
        }
    }
});

require(['Zepto','template','sm','cg',,'touch','ani'], function($,template) {
    $(".backdiv").tap(function(){
        window.history.go(-1);
     });

    $(function(){
        var puburl = localStorage.getItem("puburl");
        var picurl = localStorage.getItem("picurl");
        var memberId = localStorage.getItem("memberId");
        var loading = false;
        var trunLink = function(){
            //点击进入评论页面
            $(".item-content-mess").tap(function(){
                var id= $(this).attr("data-id");
                var postType = $(this).attr("data-postType");
                location.href = "videoDetails.html?id="+id+"&postType="+postType;
            });
            //点击进入通知详情
            $(".item-content-mess2").tap(function(){
                window.location.href = "tongzhidetail.html?id="+$(this).attr("value");
            })
        };
        var page = 1;
        var pageRows = 10;
        //点击清空
        $("#mess-qingkong").click(function(){
            $.confirm('清空所有回复消息?',
                function () {
                    $(".modal").remove();
                    var url = "";
                    if(tab == "xiaoxi"){
                        url = puburl+'/app/information/delete?memberId='+memberId; 
                        $.ajax({
                            type: 'get',
                            url: url,
                            dataType: 'json',
                            timeout: 3000,
                            success: function(data){
                                console.log(data);
                                init(tab);
                            },
                            error: function(xhr, type){
                                $("body").dalutoast('服务器开小差了～')
                                return false;
                            }
                        });
                    }       
                },
                function () {
                  $(".modal").remove();
                }
            );
        });
        function init(){ 
           if($.device.osVersion == "10.3.3"){
              $(".content").css("bottom","2.2rem");
           }else{
              $(".content").css("bottom","0");
           }    
            page = 1;
            if(tab == "xiaoxi"){
                $.ajax({
                    type: 'get',
                    url: puburl+'/app/information/list?memberId='+memberId+'&pageNo='+page+'&pageSize='+pageRows,
                    dataType: 'json',
                    timeout: 3000,
                    success: function(data){
                        console.log(data); 
                        render(data);
                        page++;
                    },
                    error: function(xhr, type){
                        $("body").dalutoast('服务器开小差了～')
                        return false;
                    }
                })
            }else{
                $.ajax({
                    type: 'get',
                    url: puburl+'/app/notice/list?pageNo='+page+'&pageSize='+pageRows,
                    dataType: 'json',
                    timeout: 3000,
                    success: function(data){
                        console.log(data); 
                        render(data);
                        page++;
                    },
                    error: function(xhr, type){
                        $("body").dalutoast('服务器开小差了～')
                        return false;
                        
                    }
                })
            }
        };
        function render(data){
            if(tab == "xiaoxi"){
                if(data&&data.code==0&&data.data.length>0){
                    data.picurl = picurl;
                    var withdw_ulHtml = template("withdw-ulTpl",data);  
                    $("#withdw-ul").html(withdw_ulHtml);
                    trunLink();
                }else{
                     var noListHtml = template("withdwkong-ulTpl",data);  
                    $("#withdw-ul").html(noListHtml);
                }
            }else{
                if(data&&data.code==0&&data.data.length>0){
                    var withdw_ulHtml = template("withdw-ulTpl2",data);  
                    $("#withdw-ul2").html(withdw_ulHtml);
                    trunLink();
                }else{
                     var noListHtml = template("withdwkong2-ulTpl2",data);  
                    $("#withdw-ul2").html(noListHtml);
                }
            } 

        };
        function renderPage(data){
            data.picurl = picurl;
            if(tab == "xiaoxi"){
                if(data&&data.code==0&&data.data.length>0){
                    var withdw_ulHtml = template("withdw-ulTpl",data);  
                    $("#withdw-ul").append(withdw_ulHtml);
                    trunLink();
                }  
            }else{
                if(data&&data.code==0&&data.data.length>0){
                    var withdw_ulHtml = template("withdw-ulTpl2",data);  
                    $("#withdw-ul2").append(withdw_ulHtml);
                    trunLink();
                }  
            }     
        };
        
      
        // 添加'refresh'监听器下拉刷新
        $(document).on('refresh', '.pull-to-refresh-content',function(e) {
            init();
            var num = Math.floor(Math.random()*6);
            
            $(".suijicont"+num).removeClass("hide");
            setTimeout(function(){
                $.pullToRefreshDone('.pull-to-refresh-content');
                $(".suijicont"+num).addClass("hide");
            },1000);
            
        });


        var loading = false;
        // 注册'infinite'事件处理函数,滚动到底部
        $(document).on('infinite', '#page-fixed-tab-infinite-scroll',function(e, id) {

            // if (loading) return;
            //   $('.infinite-scroll-preloader').removeClass("hide");
            //   loading = true;
            //   $.ajax({
            //     type: 'get',
            //     url: 'data/message.json?page='+page+'&pageRows='+pageRows+'&token='+token,
            //     dataType: 'json',
            //     timeout: 3000,
            //     success: function(data){
            //         console.log(data);
            //         loading = false;
            //         renderPage(data);
            //         if(data.data.length == 0){
            //             // 加载完毕，则注销无限加载事件，以防不必要的加载
            //             $.detachInfiniteScroll($('.infinite-scroll'));
            //             // 删除加载提示符
            //             $('.infinite-scroll-preloader').remove();
            //             $(".mypreloader").removeClass("hide");
            //         }
            //         $.refreshScroller();
            //         page++;
            //     },
            //     error: function(xhr, type){
            //         loading = false;
            //         $("body").dalutoast("网络异常");
            //     }
            //   })
        });


        var tab = "xiaoxi";
        $(".xiaoxi").click(function(){
            tab = "xiaoxi";
            $("#mess-qingkong").show();
            init();
        });
        $(".tongzhi").click(function(){
            tab = "tongzhi";
            $("#mess-qingkong").hide();
            $.attachInfiniteScroll($(".tongzhitab"));
            init();
        });
        init();
        $.init();
    })
})