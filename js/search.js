/**
 * Created by Walker on 2018/3/18.
 */


require.config({
  baseUrl: 'js',
  paths: {
    'Zepto':['lib/Zepto.min'],
    'sm':['lib/sm.min'],
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
  var pubUrl = localStorage.getItem("puburl");
  var picUrl = localStorage.getItem("picurl");
  template.helper('getPicture',function(str){
    var arr=str.split(";");
    return arr[0];
  });
  $(function(){
    var tab="tab1";
    var lishiurl=pubUrl+"/app/search/list";
    var memberId=localStorage.getItem("memberId");
    var lishipar={memberId:memberId};
    var loading = false;
    var pageNo=1;
    var pageSize=10;

    var M={
      strToken:'',//判断是否登录
      init:function(){
        M.strToken = localStorage.getItem("token") || null;//登录后有值
        this.nfiniteRolling()
        this.requestData(lishiurl,lishipar,"default");
        this.reqSearch();
        this.getPostData();
        this.getCircleData();
        this.getPicData();
        this.getVideoData();
        this.initClick();
        this.collection();
        this.dianZan();


      },
      //点击跳转到圈子内页，并且点击+号添加关注
      initClick:function(){
        $('body').on('click','.middle-content',function(e){
          var id=$(this).attr('data-id') || null;
          var followFlag=$(this).attr('followFlag') || null;
          var qzName=$(this).attr('circleName') || null;
          if (followFlag == null || id == null || qzName == null) {
            $.toast('接口参数绑定有问题');
            return false;
          }
          location.href='listofCircles.html?id='+id+'&followFlag='+followFlag+'&circleName='+qzName;
        });
        //添加关注
        $('body').on('click','.add-attention',function(e){

          if(!M.strToken){//未登录
            window.location.href="login.html";
          }else{

            $(this).children("img").attr("src","images/tick@2x.png");
              var groupId = $(this).parent(".middle-content").attr("data-id");
              var url = pubUrl + "/app/follow/save";
              var savepar={groupId:groupId,memberId:memberId};
              M.requestData(url,savepar,'save');
          }
        })
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
              if(data.data.length == 0){
                  $('.no-search').removeClass('hide');
              }else{
                  $('.no-search').addClass('hide');
              }
            $.hidePreloader();
            M.render(data,str);
            $("#search").blur();

          },
          error: function(xhr, type){
              $.toast('服务器开小差了～');
              return false;
          }
        })
      },
      //无限滚动
      nfiniteRolling :function(){
        $(document).on("pageInit", "#page-tab", function(e, id, page) {
          $(page).on('infinite', function() {
            // 如果正在加载，则退出
            if (loading) return;
            $('.infinite-scroll-preloader').removeClass("hide");
            // 设置flag
            loading = true;
            pageNo++;
            var key=$("#search").val();
            var postType=$(".tab-link.active").attr("postType");
            var par="";
            var memberId=localStorage.getItem("memberId");
            var searchUrl="";
            if(postType==4){
              searchUrl=pubUrl+"/app/search/group ";
              par={key:key,pageNo:pageNo,pageSize:pageSize,memberId:memberId}
            }else if(postType==3 || postType==1 || postType==2){
              searchUrl=pubUrl+"/app/search/article";
              par={key:key,pageNo:pageNo,pageSize:pageSize,postType:postType}
            }
            $.ajax({
              type: 'post',
              data:par,
              url:searchUrl,
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
                 // $('.no-search').addClass("hide");
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
        });
      },

      //渲染模板
      render:function(data,str){
        data.picurl=picUrl;

        var qzName='';
        $.map(data.data,function (item,index) {
          if(item &&item.name){
            item.name=item.name.replace(new RegExp("<font color='red'>","g"),"").replace(new RegExp("</font>","g"),"");
          }
          data.data[index].qzName=String(encodeURI(item.name));

          return data.data;
        });

        if(str=="default"){
          $(".card-container").html(template("searchTpl",data));
          M.clearUp();
        }else if(str=="post"){
          $(".wordList").html(template("postTpl",data));
          var title1 ='';
          var $biaoti=$(".wordList").find(".c-plaintext");
          $biaoti.each(function(i,item){
              title1=$(item).html().replace(new RegExp("&lt;","g"),"<").replace(new RegExp("&gt;","g"),">");
              $(item).html(title1);
          });
        }else if(str=="circle"){
          $(".circleContent").html(template("circleTpl",data));
          var title2 ='';
          var $biaoti=$(".circleContent").find(".searchCircle");
          $biaoti.each(function(i,item){
              title2=$(item).html().replace(new RegExp("&lt;","g"),"<").replace(new RegExp("&gt;","g"),">");
              $(item).html(title2);
          });
        }else if(str == "pic"){
          $(".pictureContent").html(template("picTpl",data));
         var title3 ='';
          var $biaoti=$(".pictureContent").find(".biaoti");
          $biaoti.each(function(i,item){
              title3=$(item).html().replace(new RegExp("&lt;","g"),"<").replace(new RegExp("&gt;","g"),">");
              $(item).html(title3);
          });
          
        }else{//视频
          $(".videoContent").html(template("videoTpl",data));
          var title4 = "";
           var $biaoti=$(".videoContent").find(".biaoti");
          $biaoti.each(function(i,item){
              title4=$(item).html().replace(new RegExp("&lt;","g"),"<").replace(new RegExp("&gt;","g"),">");
              $(item).html(title4);
          });
        }
        M.getHistorismData();
        },
        //清除历史搜索
      clearUp:function(){
        $(".Eliminate").on('click',function(){
          $(".lishi").empty();
        })
      },
      reqSearch:function(){
        $("#search").on('keypress',function(e){
            $('.circleList').css('background-color','#f5f5f5');
          var keycode = e.keyCode;
          var searchName = $(this).val();
          if(keycode == 13){
            e.preventDefault();
            if(tab == "tab1"){

              var url =pubUrl+"/app/search/article";
              var key=$("#search").val();
              var pageNo=1;
              var pageSize=10;
              var postType=3;
              var par = {key:searchName,pageNo:pageNo,pageSize:pageSize,postType:postType,memberId:memberId};
              M.requestData(url,par,'post');

            }else if(tab == "tab2"){
              var url =pubUrl+"/app/search/group";
              var key=$("#search").val();
              var pageNo=1;
              var pageSize=10;
              var par = {key:searchName,pageNo:pageNo,pageSize:pageSize,memberId:memberId};
              M.requestData(url,par,"circle");
            }else if(tab=="tab3"){
              var url = pubUrl+"/app/search/article";
              var pageNo=1;
              var pageSize=10;
              var key=$("#search").val();
              var postType=1;
              var par={key:searchName,pageNo:1,pageSize:10,postType:1}
              M.requestData(url,par,"pic");
            }else{
              var url = pubUrl+"/app/search/article";
              var pageNo=1;
              var pageSize=10;
              var key=$("#search").val();
              var postType=2;
              var par={key:searchName,pageNo:1,pageSize:10,postType:2}
              M.requestData(url,par,"video");
            }
          }
        })
      },

      //点击tab1
      getPostData:function(){
        $(".s-post").on('click',function(){
            $.attachInfiniteScroll($('.infinite-scroll'));
          tab="tab1";
          var url =pubUrl+"/app/search/article";
          var key=$("#search").val();
          var pageNo=1;
          var pageSize=10;
          var postType=3;
          var par = {key:key,pageNo:1,pageSize:10,postType:3};
          // var memberId=localStorage.getItem("memberId");
          // var defaultPar={memberId:memberId};
          var defaultPar=lishipar;
          var defaultUrl=lishiurl;
          if(key==""){
            M.requestData(defaultUrl,defaultPar,"default");
          }else{
            M.requestData(url,par,"post");
          }

        })

      },
      //点击tab2
      getCircleData:function(){
        $(".s-circle").on('click',function(){
            $.attachInfiniteScroll($('.infinite-scroll'));
          if(!$('.mypreloader').hasClass('hide')){
              $('.mypreloader').addClass('hide');
            }
          tab="tab2";
          var url =pubUrl+"/app/search/group";
          var key=$("#search").val();
          var pageNo=1;
          var pageSize=10;
          var memberId=localStorage.getItem("memberId");
          var par = {key:key,pageNo:1,pageSize:10,memberId:memberId};
          // var memberId=localStorage.getItem("memberId");
          // var defaultPar={memberId:memberId};
          var defaultPar=lishipar;
          var defaultUrl=lishiurl;
          if(key==""){
            M.requestData(defaultUrl,defaultPar,"default");
          }else{
            M.requestData(url,par,"circle");
          }

        })

      },
      //点击tab3
        getPicData:function(){
        $(".s-pic").on('click',function(){
            $.attachInfiniteScroll($('.infinite-scroll'));
            if(!$('.mypreloader').hasClass('hide')){
                $('.mypreloader').addClass('hide');
            }
          tab="tab3";
          var url = pubUrl+"/app/search/article";
          var pageNo=1;
          var pageSize=10;
          var key=$("#search").val();
          var postType=1;
          var par={key:key,pageNo:1,pageSize:10,postType:1}
          // var memberId=localStorage.getItem("memberId");
          // var defaultPar={memberId:memberId};
          var defaultUrl=lishiurl;
          var defaultPar=lishipar;
          if(key == ""){
            M.requestData(defaultUrl,defaultPar,"default");
          }else{
            M.requestData(url,par,"pic");
          }

        })

        },
      //点击tab4
      getVideoData:function(){
          $(".s-video").on('click',function(){
              $.attachInfiniteScroll($('.infinite-scroll'));
              if(!$('.mypreloader').hasClass('hide')){
                  $('.mypreloader').addClass('hide');
              }
            tab="tab4";
            var url = pubUrl+"/app/search/article";
            var pageNo=1;
            var pageSize=10;
            var key=$("#search").val();
            var postType=2;
            var par={key:key,pageNo:1,pageSize:10,postType:2};
            // var memberId=localStorage.getItem("memberId");
            // var defaultPar={memberId:memberId};
            var defaultPar=lishipar;
            var defaultUrl=lishiurl;
            console.log(defaultPar);
            if(key==""){
              M.requestData(defaultUrl,defaultPar,"default");
            }else{
              M.requestData(url,par,"video");
            }
          })

      },
        //点击历史搜索词直接搜索
        getHistorismData:function(){

          $(".noun").on('click',function(){
            $('.circleList').css('background-color','#f5f5f5');
            var key=$(this).text();
            console.log("1111111==="+key);
            $("#search").val(key) ;
            if(tab=="tab1"){
              var url =pubUrl+"/app/search/article";
              var pageNo=1;
              var pageSize=10;
              var postType=3;
              var par = {key:key,pageNo:pageNo,pageSize:pageSize,postType:postType,memberId:memberId};
              M.requestData(url,par,"post");
            }else if(tab=="tab2"){
              var url =pubUrl+"/app/search/group";
              var pageNo=1;
              var pageSize=10;
              var par = {key:key,pageNo:pageNo,pageSize:pageSize,memberId:memberId};
              M.requestData(url,par,"circle");
            }else if(tab=="tab3"){
              var url = pubUrl+"/app/search/article";
              var pageNo=1;
              var pageSize=10;
              var postType=1;
              var par={key:key,pageNo:pageNo,pageSize:pageSize,postType:postType}
              M.requestData(url,par,"pic");
            }else if(tab == "tab4"){
              var url = pubUrl+"/app/search/article";
              var pageNo=1;
              var pageSize=10;
              var postType=2;
              var par={key:key,pageNo:pageNo,pageSize:pageSize,postType:postType};
              M.requestData(url,par,"video");
            }

          })
        },
      //收藏
      collection:function(){
        $("body").on('click','.collection',function(){
          var _this =$(this);

          if (!M.strToken  || M.token=='undefined' || M.token=='null') {//未登录
              location.href = 'login.html';
              return false;
          }
          var articleId= _this.attr("articleId");

          console.log(articleId);
          var title = $(".picture-Content-header").text();
          // var videoUrl=$("source").attr("src");
          var imageUrl =_this .find("img").attr("src");
          var type =1;
          var par={articleId:articleId,memberId:memberId};
          var url = pubUrl+"/app/favor/save";
          $.ajax({
            type: 'post',
            url: url,
            data: par,
            dataType: 'json',
            timeout: 5000,
            success: function (data) {
              if(data.code == 1){
                _this .find("img").attr("src","images/all_icon_Collection_press.png");
              }else if(data.code == 2){
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
        $("body").on('click','.fabulous',function(){
          var _this =$(this);
            if (!M.strToken  || M.token=='undefined' || M.token=='null') {//未登录
                location.href = 'login.html';
                return false;
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
            timeout: 5000,
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
    //删除输入框内容
    (function deleteVal() {
      $('.shanchu').click(function(){
        $('#search').val('');
      })
    })();

  })

})

