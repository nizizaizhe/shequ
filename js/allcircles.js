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
    var loading = false;
    var pubUrl = '';
    var picUrl='';
    var pageNo = 1;
    var pageSize=10;
    var categoryId = "";
    var tjpar='';
    var par={pageNo:pageNo,pageSize:pageSize};
    var url='';
    var tjurl='';
    var memberId ='';
     var token = localStorage.getItem("token");
    var M={
      init:function(){
        pubUrl = localStorage.getItem("puburl");
        picUrl=localStorage.getItem("picurl");
        memberId=localStorage.getItem('memberId');

        tjurl=pubUrl+"/app/circle/all";
        tjpar={pageNo:pageNo,pageSize:pageSize,categoryId:categoryId,'memberId':memberId};
        url=pubUrl+"/app/category/all";
        this.requestData(url,par,'init');

        this.nfiniteRolling();
        this.initClick();

      },
      initClick:function () {
        M.dropDown();
          //跳转圈子详情
          $("body").on('click','.middle-content',function(e){
              var id=$(this).attr('data-id') || null;
              var followFlag=$(this).attr('followFlag') || null;
              var qzName=$(this).attr('circleName') || null;
              if(followFlag ==null || id==null || qzName == null){
                  $.toast('接口参数绑定有问题');
                  return false ;
              }
              location.href='listofCircles.html?id='+id+'&followFlag='+followFlag+'&circleName='+qzName;
          });

        $(document).on('click','.add-attention',function(e){
          var $this=$(this);
            var followflag = $(this).prev(".middle-content").attr("followflag");
            if(followflag==1){
              return false;
            }
          if(!token){
            window.location.href="login.html";
          }else{

            var groupId = $(this).prev(".middle-content").attr("data-id");
            var urlSave = pubUrl+"/app/follow/save";
            var savepar={groupId:groupId,memberId:memberId};
            //调用添加关注
            M.requestData(urlSave,savepar,$this);

          }


        });

        //点击标签获取下面页面数据
        $("body").on('click','.tab-link',function(){
          $(this).addClass('active').siblings().removeClass('active');
            categoryId = $(this).attr("id");
          var memberId = localStorage.getItem("memberId");
          var par={pageNo:pageNo,pageSize:pageSize,memberId:memberId,categoryId:categoryId}
          var urlList=pubUrl+"/app/circle/all";
          M.requestData(urlList,par,"list");
        });
      },
        //下拉刷新
      dropDown:function(){
        // 添加'refresh'监听器下拉刷新
        $(document).on('refresh', '.pull-to-refresh-content',function(e) {
          // $.attachInfiniteScroll($(".infinite-scroll"));
          setTimeout(function(){
            $.pullToRefreshDone('.pull-to-refresh-content');
            tjpar.pageNo=1;
            M.requestData(tjurl,tjpar);
          },1000);
        });
      },
      //无限滚动
      nfiniteRolling :function(){
       // M.getcategoryData();
        $(document).on("infinite", ".infinite-scroll", function() {
          var urlList=pubUrl+"/app/circle/all";
          var par={pageNo:pageNo,pageSize:pageSize,memberId:memberId,categoryId:categoryId}
          if (loading) return;
          $('.infinite-scroll-preloader').removeClass('hide');
          //设置flag
          loading  =true;
          setTimeout(function(){
            //重置加载flag
            loading = false;
            if(pageSize*pageNo >= M.totalCount){
              // 加载完毕，则注销无限加载事件，以防不必要的加载
              $.detachInfiniteScroll($('.infinite-scroll'));
              // 删除加载提示符
              $('.infinite-scroll-preloader').remove();
              $('.mypreloader').css('display','block');//显示加载到底
              return;
            }
            //添加新条目
            pageNo++;
            M.requestData(urlList,par,"list");//所有圈子
            //容器发生改变，如果是js滚动，需要刷新滚动

            $.refreshScroller();

          },500)
        });
      },
      //请求数据
      requestData:function(url,parameter,str){
        $.ajax({
          type:'post',
          url:url,
          data:parameter,
          dataType:'json',
          timeout: 3000,
            sync:false,
          success: function(data){
           if(str=="list"){
             M.renderlist(data);
           }else if(str=='init'){//category
               M.render(data);
            var iCategoryId = $(".tab-link").eq(0).attr("id");
             M.defaultData(iCategoryId);
           } else {//save
               $(str).find("img").attr("src","images/tick@2x.png");
              $(str).prev(".middle-content").attr("followflag",1);
           }
          },
          error: function(xhr, type){
              $.toast('服务器开小差了～');
              return false;
          }
        })
      },
      //模板渲染
      render:function(data){
        data.puburl=pubUrl;
         $(".buttons-tab").html(template('labelPageTpl',data));
      },
      renderlist:function(data){
        var qzName='';
        $.map(data.data,function (item,index) {
          data.data[index].qzName=String(encodeURI(item.name));
          return data.data;
        });
        data.puburl=pubUrl;
        data.picurl=picUrl;
        $(".circleList").html(template('allCirclesTpl',data));
      },
      //默认请求第一个标签页的数据
      defaultData:function(iCategoryId){
        var memberId = localStorage.getItem("memberId");
        var par={pageNo:pageNo,pageSize:pageSize,categoryId:iCategoryId,memberId:memberId}
        var urlList=pubUrl+"/app/circle/all";
        M.requestData(urlList,par,"list");
      }
    };
    M.init();

    $.init();
  })

})
