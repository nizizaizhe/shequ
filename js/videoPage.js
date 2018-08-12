/**
 * Created by Walker on 2018/3/17.
 */


require.config({
  baseUrl: 'js',
  paths: {
    'Zepto':['//g.alicdn.com/sj/lib/zepto/zepto.min','lib/Zepto.min'],
    'sm':['//g.alicdn.com/msui/sm/0.6.2/js/sm.min','lib/sm.min'],
    'template': 'lib/template.min',
    'config': 'lib/config'
  },
  shim: {
    'Zepto':{exports:'Zepto'},
    'config':{deps:['Zepto']},
    'sm':{
      deps: ['Zepto']
    }
  }
});
require(['Zepto','template','sm','config'], function($,template) {

  template.helper('getPicture',function(str){
    var arr=str.split(";");
    return arr[0];
  });

  $(function(){
    var pageNo=1;
    var pageSize=10;
    var postType=2;
    var loading = false;
    var pubUrl="";
    var picUrl = "";

    var M={
      strToken:'',//判断是否登录
      init:function(){
        pubUrl = localStorage.getItem("puburl");
        picUrl =localStorage.getItem("picurl");
        M.strToken =localStorage.getItem("token") || null;//登录后有值
        var url=pubUrl+"/app/article/recommend/list";
        var par={page:1,pageSize:10,postType:2};
        this.requestData(url,par);
        this.dropDown();
        this.nfiniteRolling();
      },
      requestData:function(url,parameter){
        $.ajax({
          type: 'post',
          url:url,
          data:parameter,
          dataType: 'json',
          timeout: 3000,
          success: function(data){
            $.pullToRefreshDone('.pull-to-refresh-content');
            console.log(data);
            $.hidePreloader();
            M.render(data);
            M.dianZan();
            M.collection();
          },
          error: function(xhr, type){
              $.toast('服务器开小差了～');
              return false;
          }
        })
      },
      //下拉刷新
        dropDown :function(data){
          $(document).on('refresh', '.pull-to-refresh-content',function(e) {
            pageNo=1;
            var url = "";
            var par = "";
            var postType=2;
            url=pubUrl+"/app/article/recommend/list";
            par={pageNo:pageNo,pageSize:pageSize,postType:postType};
              var t = setTimeout(function(){
                  M.requestData(url,par);
                  $.pullToRefreshDone('.pull-to-refresh-content');
                  clearTimeout(t);
              },1000);
          });
        },
      //无限滚动
      nfiniteRolling :function(){
        $(document).on('infinite', '.infinite-scroll',function(){
            // 如果正在加载，则退出
            if (loading) return;
            $('.infinite-scroll-preloader').removeClass('hide');
            // 设置flag
            loading = true;
            // 模拟1s的加载过程
            setTimeout(function() {
                // 重置加载flag
                loading = false;
                if (pageSize*pageNo >= M.totalCount){
                    // 加载完毕，则注销无限加载事件，以防不必要的加载
                    $.detachInfiniteScroll($('.infinite-scroll'));
                    // 删除加载提示符
                    $('.infinite-scroll-preloader').remove();
                    $('.mypreloader').css('display','block');//显示加载到底
                    return;
                }
                // 添加新条目
                pageNo++;
                M.reqRefresh();//推介圈子
                //容器发生改变,如果是js滚动，需要刷新滚动
                $.refreshScroller();
            }, 500);
        });
      },
        reqRefresh:function(){
            var tjpar ={pageNo:pageNo,pageSize:pageSize,postType:postType};
            var url=pubUrl+"/app/article/recommend/list";
            $.ajax({
                type: 'post',
                data:tjpar,
                url:url,
                dataType: 'json',
                timeout: 6000,
                success: function(data){
                    M.render(data,true);
                    loading = false;
                    if (data.data.length==0) {
                        // 加载完毕，则注销无限加载事件，以防不必要的加载
                        $.detachInfiniteScroll($('.infinite-scroll'));
                        // 删除加载提示符
                        $('.infinite-scroll-preloader').remove();
                        $(".mypreloader").removeClass("hide");
                        return;
                    }
                    $.refreshScroller();
                },
                error: function(xhr, type){
                    $.toast('服务器开小差了～');
                    return false;
                }
            })
        },
      //渲染模板
      render:function(data,isscroll){
          data.puburl=pubUrl;
          data.picurl=picUrl;
          var strAvatar=data.avatar;
          $.map(data.data,function (item,index) {
              item.thumbnail=picUrl+item.thumbnail;
              var strAvatar=data.avatar;
              item.avatar=picUrl+item.avatar;
              return data.data;
          })//andiqu
        if(isscroll){
          $(".list-block").append(template("videoTpl",data));
        }else{
          $(".list-block").html(template("videoTpl",data));
        }

      },

        //收藏
        collection:function(){
            $(".collection").on('click',function(){
                var _this =$(this);
                    if (M.strToken=="null"||M.strToken=="undefined"||M.strToken=="") {
                        location.href = "login.html";
                        return false;
                    }
                    var articleId= _this.attr("articleId");
                    var memberId =localStorage.getItem("memberId");
                    var par={articleId:articleId,memberId:memberId};
                    var url = pubUrl+"/app/favor/save";
                    $.ajax({
                        type: 'post',
                        url: url,
                        data: par,
                        dataType: 'json',
                        timeout: 3000,
                        success: function (data) {
                            if(data.code == 1){
                                _this .find("img").attr("src","images/all_icon_Collection_press.png");
                            }else{
                                _this .find("img").attr("src","images/all_icon_Collection_normal.png");
                            }
                            console.log(data);
                            $.hidePreloader();
                        },
                        error: function (xhr, type) {
                            $.toast('服务器开小差了～');
                            return false;

                        }
                    })

                })
        },


        //点赞
      dianZan:function(){
        $(".fabulous").on('click',function(){
          var _this =$(this);
          if(M.strToken=="null"||M.strToken=="undefined"||M.strToken==""){
              window.location.href = "login.html";
              return false;
          }
          var memberId =localStorage.getItem("memberId");
          var articleId= _this.attr("id");
          var par={memberId:memberId,articleId:articleId};
          var url = pubUrl+"/app/support/isFaver";
          var num=_this.find("span").text();
          $.ajax({
            type: 'post',
            url: url,
            data: par,
            dataType: 'json',
            timeout: 6000,
            success: function (data) {
              if(data.code ==0){
                _this.find("img").attr("src","images/all_icon_Good_press.png");
                _this.find("span").text(++num);
              }else if(data.code == 1){
                _this.find("img").attr("src","images/all_icon_Good_normal.png");
                _this.find("span").text(--num);
              }
              console.log(data);
            },
            error: function (xhr, type) {
                $.toast('服务器开小差了～');
                return false;
            }
          })


        })
      }

    }

    M.init();
    $.init();
  })

})
