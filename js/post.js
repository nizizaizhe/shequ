/**
 * Created by Walker on 2018/3/25.
 */
/**
 * Created by Walker on 2018/3/18.
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
    var pageNo=2;
    var pageSize=10;
    var postType=3;
    var loading=false;
    var url ="";

    var M={
        picurl:'',
        puburl:'',
        strToken:'',//判断是否登录
        init:function(){
          M.strToken =localStorage.getItem("token") || null;//登录后有值
          M.picurl = localStorage.getItem("picurl");
          M.puburl = localStorage.getItem("puburl");
          url=M.puburl+"/app/article/recommend/list";
        var par={pageNo:1,pageSize:10,postType:3};
        this.dropDown();
        this.nfiniteRolling();
        this.requestData(url,par);
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
            M.render(data,false);
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
          var postType=3;
          url=M.puburl+"/app/article/recommend/list";
          par={pageNo:pageNo,pageSize:pageSize,postType:postType};
          M.requestData(url,par);

        });
      },
      //无限滚动
      nfiniteRolling :function(){
        $(document).on('infinite', '.infinite-scroll',function(){
            if (loading) return;
            $(".infinite-scroll-preloader").removeClass("hide");
            loading = true;
            pageNo++;
            var tjpar ={pageNo:pageNo,pageSize:pageSize,postType:postType};
            var url=M.puburl+"/app/article/recommend/list";
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
                  // 加载完毕，则注销无限加载
                  // 删除加载提示符
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
        });
      },
      //渲染模板
      render:function(data,isscroll){
        data.picurl=M.picurl;
        $.map(data.data,function (item,index) {
          item.avatar=M.picurl+item.avatar;
          item.thumbnail=M.picurl+item.thumbnail;
          return data.data;
        });
        if(isscroll){
          $(".postContent").append(template("postTpl",data));
        }else{
          $(".postContent").html(template("postTpl",data));
        }
      },

      //收藏
      collection:function(){
        $(".collection").on('click',function(){
          var _this =$(this);
          if(!M.strToken){
            window.location.href="login.html";
            return false;
          }
          var articleId= _this.attr("articleId");
          var memberId =localStorage.getItem("memberId");
          var type =1;
          var par={articleId:articleId,memberId:memberId};
          var url = M.puburl+"/app/favor/save";
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
          if(!M.strToken){
            window.location.href="login.html";
            return false;
          }
          var memberId =localStorage.getItem("memberId");
          var articleId= _this.attr("id");
          var par={memberId:memberId,articleId:articleId};
          var url = M.puburl+"/app/support/isFaver";
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
            },
            error: function (xhr, type) {
                $.toast('服务器开小差了～');
                return false;
            }
          })
        })
      }
    };
    M.init();
    $.init();
  })

})
