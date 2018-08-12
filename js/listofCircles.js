/**
 * Created by Walker on 2018/3/14.
 */
/**
 * Created by Walker on 2018/3/10.
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

  template.helper('getPicture',function(str){
    var arr=str.split(";");
    return arr[0];
  });
  $(function(){
    var pageSize =100;
    var pageNo = 1;
    var postType="";
    var groupId="";
      var par='';
     var tab="tab1";
    var M= {
        pubUrl:'',
        picUrl:'',
        url:'',
        token:'',
        memberId:'',
      init:function () {
          M.token = localStorage.getItem("token") ;
          M.memberId = localStorage.getItem("memberId");
          groupId = M.getQueryString("id");
         M.pubUrl = localStorage.getItem("puburl");
         M.picUrl=localStorage.getItem("picurl");
         M.url=M.pubUrl+"/app/article/group/list";
        par={pageNo:pageNo,pageSize:pageSize,postType:postType,groupId:groupId,memberId:M.memberId};
     //   this.dropDown();
       // this.showMore();
        this.showName();
       // par={pageNo:pageNo,pageSize:pageSize,postType:postType,groupId:groupId};
        this.requestData(M.url,par,"tab1",'0');
        var noticeUrl=M.pubUrl+"/app/circle/groupNotice";
         var noticePar={groupId:groupId};
        this.requestData(noticeUrl,noticePar,"tab1",'1');
        this.getPostData();
        this.getPicData();
        this.getVideoData();
        this.goDetail();
       this.initClick();
          M.dianZan();
          M.collection();
      },
      requestData:function(url,parameter,str,i){
        $.ajax({
          type: 'post',
          url:url,
          data:parameter,
          dataType: 'json',
          timeout: 3000,
          success: function(data){
              if(i!=='1'){//1:全部分类下有广告接口 （不是广告接口）
                  $.map(data.data,function (item,index) {
                      item.avatar=M.picUrl+item.avatar;
                      item.imageUrl=M.picUrl+item.imageUrl;
                      item.groupLogo=M.picUrl+item.groupLogo;
                      item.videoCover=M.picUrl+item.videoCover;
                      item.videoUrl=M.picUrl+item.videoUrl;
                      item.picurl=M.picUrl;
                      return data.data;
                  })
              };
            if(str == "tab1"){

              M.render(data,"tab1",i);//全部
            }else if(str == "tab2"){//贴子
              data.picurl=M.picUrl;
              M.render(data,"tab2");
            }else if(str == "tab3"){//图片
              M.render(data,"tab3");
            }else  if(str == "tab4"){
              M.render(data,"tab4");//视频
            }

          },
          error: function(xhr, type){
              $.toast('服务器开小差了～');
              return false;
          }
        })
      },
        initClick: function () {

            //刷新
            // 添加'refresh'监听器
            $(document).on('refresh', '.pull-to-refresh-content', function (e) {
                // 模拟2s的加载过程
                var t = setTimeout(function () {
                    pageNo = 1;
                    if(tab==="tab1"){
                        par.postType='';
                        //列表
                        M.requestData(M.url,par,"tab1",'0');
                    }else if(tab === "tab2"){
                        par.postType=3;
                        M.requestData(M.url,par,"tab2");
                    }else if(tab === "tab3"){
                        par.postType=1;
                        M.requestData(M.url,par,"tab3");
                    }else if(tab === "tab4"){
                        par.postType=2;
                        M.requestData(M.url,par,"tab4");
                    }
                    // 加载完毕需要重置
                    $.pullToRefreshDone('.pull-to-refresh-content');
                    clearTimeout(t);
                }, 1000);
            });




                $(document).on('infinite', "infinite-scroll", function() {
                    // 如果正在加载，则退出
                    if (loading) return;
                    // 设置flag
                    loading = true;

                    // 模拟1s的加载过程
                    setTimeout(function() {
                        // 重置加载flag
                        loading = false;

                        // 重置加载flag
                        loading = false;
                        if (pageSize * pageNo >= M.totalCount) {
                            // 加载完毕，则注销无限加载事件，以防不必要的加载
                            $.detachInfiniteScroll($('.infinite-scroll'));
                            // 删除加载提示符
                            $('.infinite-scroll-preloader').remove();

                            $('.mypreloader').css('display', 'block');//显示加载到底
                            // 加载完毕，则注销无限加载事件，以防不必要的加载:$.detachInfiniteScroll($('.infinite-scroll').eq(tabIndex));多个无线滚动请自行根据自己代码逻辑判断注销时机
                            return;
                        }
                        pageNo++;
                        par.pageNo=pageNo;
                        if(tab==="tab1"){
                            par.postType='';
                            //列表
                            M.requestDataRefresh(M.url,par,"tab1",'0');
                        }else if(tab === "tab2"){
                            par.postType=3;
                            M.requestDataRefresh(M.url,par,"tab2");
                        }else if(tab === "tab3"){
                            par.postType=1;
                            M.requestDataRefresh(M.url,par,"tab3");
                        }else if(tab === "tab4"){
                            par.postType=2;
                            M.requestDataRefresh(M.url,par,"tab4");
                        }
                        $.refreshScroller();
                    }, 1000);
                });
        },

        requestDataRefresh:function(url,parameter,str){
            $.ajax({
                type: 'post',
                data:parameter,
                url:url,
                dataType: 'json',
                timeout: 6000,
                success: function(data){
                    M.render(data,true);
                    loading = false;
                    if (data.data.length===0) {
                        // 加载完毕，则注销无限加载事件，以防不必要的加载
                        $.detachInfiniteScroll($('.infinite-scroll'));
                        // 删除加载提示符
                        $('.infinite-scroll-preloader').remove();
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
      render:function(data,str,i){

        data.puburl=M.pubUrl;
        data.picurl=M.picUrl;

        if(str=="tab1"){
            if(i==='1'){
                $(".text-content").html(template("noticeTpl",data));//notice
            }else{
              var strText='';
                $(".card-container").append(template("prentTpl",data));//

            }
        }else if(str == "tab2"){
          $("#card-container2").html(template("tab2Tpl",data));
            $('.card-container').css('margin-bottom','1.75rem');
        }else if(str == "tab3"){
          $("#card-container3").html(template("tab3Tpl",data));
        }else{
          $("#card-container4").html(template("tab4Tpl",data));
        }

      },
     /* //显示更多
      showMore:function(){
          $(".show-more").hide();
          if($(".text-body").height()>62){
            $(".show-more").show();
            $(".text-body").addClass("clamp");
          }
          $(document).on("click",".show-more",function(){
            if($(".show-more").text()=="显示更多"){
              $(".show-more").text("收起");
              $(".text-body").removeClass("clamp");
            }else{
              $(".show-more").text("显示更多");
              $(".text-body").addClass("clamp");
            }

          })
        },*/
      //获取参数
      getQueryString:function (name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return unescape(r[2]); return null;
    },

      //点击全部or帖子标签
      getPostData:function(){

          //全部
          $(".l-all").on("click",function(){
              tab='tab1';
          });
        $(".l-post").on("click",function(){
          var postType=3;
          tab='tab2';
          groupId = M.getQueryString("id");
          var par={pageNo:pageNo,pageSize:pageSize,postType:postType,groupId:groupId,'memberId':M.memberId};
          M.requestData(M.url,par,"tab2");
        })
      },
      //点击图片标签
      getPicData:function(){
        $(".l-pic").on("click",function(){
          var postType=1;
            tab='tab3';
          groupId = M.getQueryString("id");
          var par={pageNo:pageNo,pageSize:pageSize,postType:postType,groupId:groupId,'memberId':M.memberId};

          M.requestData(M.url,par,"tab3");
        })
      },
      //点击视频标签
      getVideoData:function(){
        $(".l-video").on("click",function(){
          var postType=2;
            tab='tab4';
          groupId = M.getQueryString("id");
          var par={pageNo:pageNo,pageSize:pageSize,postType:postType,groupId:groupId,'memberId':M.memberId};
          M.requestData(M.url,par,"tab4");
        })
      },
      //带参数去下个页面
      goDetail:function(){
        // var groupId = this.getQueryString("id");
          var followFlag =  M.getQueryString("followFlag");
        $(".goxq").on('click',function(){
          window.location.href='circleDetails.html?id='+groupId+'&followFlag='+followFlag;
        })
      },
      //显示圈子名称
      showName:function(){
       var strParms=location.search;
       var arrParms=strParms.split('&');
       var strQzName=arrParms[2].toString();
          var arrQzName= strQzName.split('=');
        var name=decodeURI(arrQzName[1]);
        $(".title ").text(name);

          var followFlag =  M.getQueryString("followFlag").toString();
          if(followFlag=='1'){//已关注
              $('.guanzhu').text('已关注')
          }else{
              $('.guanzhu').text('未关注')
          }
      },

      //收藏
      collection:function(){
        $("body").on('click','.collection',function(){
          var _this =$(this);

          if(!M.token){
            window.location.href="login.html";
            return false;
          }
          var articleId= _this.attr("articleId");
          var title = $(".picture-Content-header").text();
          // var videoUrl=$("source").attr("src");
          var imageUrl =_this .find("img").attr("src");
          var type =1;
          var par={'articleId':articleId,'memberId':M.memberId};
          var url = M.pubUrl+"/app/favor/save";
          $.ajax({
            type: 'post',
            url: url,
            data: par,
            dataType: 'json',
            timeout: 5000,
            success: function (data) {
              if(data.code == 1){//收藏成功
                _this .find("img").attr("src","images/all_icon_Collection_press.png");
              }else if(data.code == 2){//取消收藏成功
                  _this .find("img").attr("src","images/all_icon_Collection_normal.png");
              }
              else {//接口错误
                  $.toast(data.message);
              }
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
            if (!M.token  || M.token=='undefined' || M.token=='null') {//未登录
                location.href = 'login.html';
                return false;
            }
          var articleId= _this.attr("articleId");
          var par={memberId:M.memberId,articleId:articleId};
          var url = M.pubUrl+"/app/support/isFaver";
          var num=_this.find("span").text();
          $.ajax({
            type: 'post',
            url: url,
            data: par,
            dataType: 'json',
            timeout: 6000,
            success: function (data) {
              if(data.code ==0){//点赞成功
                _this.find("img").attr("src","images/all_icon_Good_press.png");
                _this.find("span").text(++num);
              }else if(data.code == 1){//取消点赞
                _this.find("img").attr("src","images/all_icon_Good_normal.png");
                _this.find("span").text(--num);
              }else{
                  $.toast(data.message)
              }
            },
            error: function (xhr, type) {
                $.toast('服务器开小差了～');
                return false;
            }
          })
        })
      }
    }
    function shifoufollow(){
      var followFlag = M.getQueryString("followFlag");
      if(followFlag ==1){
        $(".guanzhu").text("已关注");
      }else{
        $(".guanzhu").text("未关注");
      }
    }
    // shifoufollow();
    M.init();
    $.init();
  });

})
