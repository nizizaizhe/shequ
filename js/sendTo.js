
require.config({
  baseUrl: 'js',
  paths: {
    'Zepto':['lib/Zepto.min'],
    'touch':'lib/touch',
    'ani':'lib/animate',
    'sm':['lib/sm'],
    'config':'lib/config',
    'template': 'lib/template.min'
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
require(['Zepto','template','sm','touch','ani','config'], function($,template) {
    var puburl = localStorage.getItem("puburl"),
        picurl = localStorage.getItem("picurl"),
        userId = localStorage.userId,
        memberId = localStorage.memberId,
        token = localStorage.token;
        page = 1;
        pageRows = 10;
        var id = "";
    $(".backdiv").tap(function(){
        window.history.go(-1);
     });

    $(function(){
        var postType = getQueryString("postType");
        var show = "";
        var isniming = 'no';
        if(postType == 1){
          // 图片
        }else if(postType == 2){
          // 视频
        }else if(postType == 3){
            show = getQueryString("show");
            // 帖子
        }
        function getQueryString(name) {
          var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
          var r = window.location.search.substr(1).match(reg);
          if (r != null) return unescape(r[2]); return null;
        }
        function parseDom(arg) {
        　　 var objE = document.createElement("div");
        　　 objE.innerHTML = arg;
        　　 return objE.childNodes;
        };
        var trunLink = function(){
            $("#withdw-ul li").tap(function(){
                $("#withdw-ul li").removeClass("sendTo-choosecolor");
                $(this).addClass("sendTo-choosecolor");
                id = $(this).attr("data-id");
            });
            $("#withdw-ul2 li").tap(function(){
                $("#withdw-ul2 li").removeClass("sendTo-choosecolor");
                $(this).addClass("sendTo-choosecolor");
                id = $(this).attr("data-id");
            })
        };
        //点击完成
        $("#wancheng").click(function(){
            isniming = getQueryString("isniming");
            window.location.href = "toReleaseFinish.html?id="+id+"&&postType="+postType+"&&show="+show+"&&isniming="+isniming
        });
        //点击键盘搜索
        $("#search").on('keypress',function(e){
          var keycode = e.keyCode;
          var searchName = $(this).val();
          if(keycode == 13){
             tab = "allcircle";
             $(".allcircle").addClass("active");
             $("#tab1").addClass("active");
             $(".guanzhu").removeClass("active");
             $("#tab2").removeClass("active");
             init("sousuo",searchName);
             e.preventDefault();
          }
        });
        function init(str,key){
            page = 1;
            var url = "";
            var data ="";
            if(tab == "allcircle"&&str=="sousuo"){
                url = puburl+'/app/search/group';
                data = {memberId:memberId,pageNo:page,pageSize:pageRows,key:key,postType:postType} 
            }else if(tab == "guanzhu"){
                url = puburl+'/app/circle/groupList';
                data = {memberId:memberId,pageNo:page,pageSize:pageRows,postType:postType};
            }else {
                url = puburl+'/app/circle/allList';      
                data = {pageNo:page,pageSize:pageRows,postType:postType}
            }
            $.ajax({
                type: 'post',
                url: url,
                data:data,
                dataType: 'json',
                timeout: 3000,
                success: function(data){
                    console.log(data);
                    data.picurl = picurl;
                    render(data,str);
                    page++;
                },
                error: function(xhr, type){
                    $("body").dalutoast('服务器开小差了～')
                    return false;
                }
            })
        };
        function render(data,str){
            if(tab == "allcircle"){
                if(str=="sousuo"){
                    if(data && data.code == 0 && data.data.length>0){
                        var allhtml = "";
                        $.each(data.data,function(index,item){
                            var html = '<li class="concern concern-start mr0" data-id= '+
                                       item.id+
                                       '>'+
                                       '<div class="concern-cont">'+
                                       '<img src="'+
                                        picurl + item.logo+
                                        '">'+
                                       '</div>'+
                                       '<div class="flex-grow1">'+
                                       '<div>'+
                                       item.name+
                                       '</div>'+
                                       '<p>'+
                                       item.brief+
                                       '</p></div></li>'; 
                            allhtml+=html;                                                                                                                                                                                               
                        });
                        $("#withdw-ul").html(allhtml);
                        trunLink();
                    }
                }else{
                    if(data && data.code == 0 && data.data.length>0){
                        var withdw_ulHtml = template("withdw-ulTpl",data);  
                        $("#withdw-ul").html(withdw_ulHtml);
                        trunLink();
                    }else{
                        var noListHtml = template("withdwkong1-ulTpl1");  
                        $("#withdw-ul").html(noListHtml);
                    }
                }
            }else{
                if(data && data.code == 0 && data.data.length>0){
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
            if(tab == "allcircle"){
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
            $.attachInfiniteScroll($(".infinite-scroll"));
            $.attachInfiniteScroll($(".guanzhutab"));
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
            if (loading) return;
              $('.infinite-scroll-preloader').removeClass("hide");
              loading = true;
              var url = "";
              var data  = "";
              if(tab == "allcircle"){
                url = puburl+'/app/circle/allList';
                data = {pageNo:page,pageSize:pageRows,postType:postType};
              }else{
                url = puburl+'/app/follow/list';
                data = {memberId:memberId,pageNo:page,pageSize:pageRows};
              }
              $.ajax({
                type: 'post',
                url: url,
                data:data,
                dataType: 'json',
                timeout: 3000,
                success: function(data){
                    console.log(data);
                    data.picurl = picurl;
                    renderPage(data);
                    loading = false;
                    if(data.data.length == 0){
                        // 加载完毕，则注销无限加载事件，以防不必要的加载
                        $.detachInfiniteScroll($('.infinite-scroll'));
                        $.detachInfiniteScroll($('.guanzhutab'));
                        // 删除加载提示符
                        $('.infinite-scroll-preloader').remove();
                        $(".mypreloader").removeClass("hide");
                    }
                    $.refreshScroller();
                    page++;
                },
                error: function(xhr, type){
                    loading = false;
                    $("body").dalutoast('服务器开小差了～')
                    return false;
                }
              })
        });


        var tab = "allcircle";
        $(".allcircle").tap(function(){
            tab = "allcircle";
            $("#search").val("");
            $.attachInfiniteScroll($(".infinite-scroll"));
            init();
        });
        $(".guanzhu").tap(function(){
            tab = "guanzhu";
            $("#search").val("");
            $.attachInfiniteScroll($(".guanzhutab"));
            init();
        });
        init();
        $.init();
    })
})