/**
 * Created by Walker on 2018/3/17.
 */
/**
 * Created by Walker on 2018/3/10.
 */
require.config({
    baseUrl: 'js',
    paths: {
        'Zepto':['lib/Zepto.min'],
        'touch':'lib/touch',
        'ani':'lib/animate',
        'cg':'lib/config',
        'sm':['lib/sm.min'],
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

require(['Zepto','template','sm','cg','touch','ani'], function($,template) {
    template.helper('getPicture',function(str){
        var arr=str.split(";");
        return arr[0];
    });

  $(function(){
    var pubUrl = "";
    var picUrl = "";//andiqu
    var videoUrl="";
    var pageNo=1;
    var pageSize=3;
    var postType=1;
    var loading = false;
    var memberId="";
    var id="";
    var articleId = "";
    var strToken = '';
    var M={
        totalCount:0,
      init:function(){
        pubUrl = localStorage.getItem("puburl");//接口地址
        picUrl = localStorage.getItem("picurl");//图片地址
      strToken = localStorage.getItem("token") || null;
       var url=pubUrl+"/app/article/recommend/list";
       var par={pageNo:pageNo,pageSize:pageSize,postType:postType};
       this.requestData(url,par);
       this.dropDown();
       this.nfiniteRolling();
        id=this.getQueryString("id");
        articleId=id;
        memberId=this.getQueryString("memberId");
        // var isFavorUrl = pubUrl+"/app/favor/isFavor";
        // var isFavorPar = {memberId:memberId,articleId:articleId};
        // this.requestData(isFavorUrl,isFavorPar);
      },
      //请求数据
      requestData:function(url,parameter,str){
        $.ajax({
          type: 'post',
          url:url,
          data:parameter,
          dataType: 'json',
          timeout: 3000,
          success: function(data){
            M.totalCount=data.page.totalCount;
            M.render(data);
            $.pullToRefreshDone('.pull-to-refresh-content');
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
        $(document).on('refresh', '.pull-to-refresh-content',function(e){
          pageNo=1;

          var url=pubUrl+"/app/article/recommend/list";
          var par={pageNo:pageNo,pageSize:pageSize,postType:postType};
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
              item.avatar=picUrl+item.avatar;
            item.thumbnail=picUrl+item.thumbnail;
            return data.data;
          })//andiqu
        if(isscroll){
          $(".picwrap").append(template("picTpl",data));
        }else{
          $(".picwrap").html(template("picTpl",data));
        }
      },
      //获取参数
      getQueryString:function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
      },
      //收藏
      collection:function(){
        $(".collection").on('click',function(){
          var _this = $(this);
          if(!strToken){
            window.location.href="login.html";
          }
          var articleId= _this.attr("articleId");
          var memberId =localStorage.getItem("memberId");
          var title = $(".picture-Content-header").text();
          var imageUrl =_this .find("img").attr("src");
          var type =1;
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
                _this.find("img").attr("src","images/all_icon_Collection_press.png");
              }else{
                _this.find("img").attr("src","images/all_icon_Collection_normal.png");
              }
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
          if(!strToken){
            window.location.href="login.html";
          }
          var memberId =localStorage.getItem("memberId");
          var articleId= _this.attr("id");
          var par={memberId:memberId,articleId:articleId};
          console.log(par);
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
            },
            error: function(xhr, type) {
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
