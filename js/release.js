/**
 * Created by dalu on 2018/3/19.
 */
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
  $(function(){
    $(".backdiv").tap(function(){
        window.history.go(-1);
    });
    template.helper('getPicture',function(str){
      var arr=str.split(";");
      return arr[0];
    });
    var M = {
            puburl: localStorage.getItem("puburl"),
            picurl: localStorage.getItem("picurl"),
            memberId:localStorage.getItem("memberId"),
            pageNo:1,
            pageSize:7,
            loading :false,
            postType:3,
            tab:"tab1",
            globtab:"tab1",
            globtab1btm:false,
            globtab2btm:false,
            globtab3btm:false,
            globck2:false,
            globck3:false,
            init: function(){
                if($.device.osVersion == "10.3.3"){
                    $(".content").css("bottom","2.2rem");
                 }else{
                    $(".content").css("bottom","0");
                 }
                this.reqdata();
                this.dropDown();
                this.scroll();
                this.tabclick();
            },
            tabclick:function(){
              _this = this;
                $(".tiezi").tap(function(){
                  if(M.globtab1btm){

                  }else{
                    $.attachInfiniteScroll($('.infinite-scroll'));
                  }
                   _this.tab = "tab1";
                   _this.postType = 3;
                   _this.pageNo = 1;
                   //_this.reqdata();
                });
                $(".tupian").tap(function(){
                  _this.tab = "tab2";
                  _this.postType = 1;
                  _this.pageNo = 1;
                  if(M.globtab2btm){

                  }else{
                    $.attachInfiniteScroll($('.infinite-scroll'));
                  }
                  if(!M.globck2){
                      M.globck2 = true;
                      _this.reqdata();
                  }   
                });
                $(".shipin").tap(function(){
                  _this.tab = "tab3";
                  _this.postType = 2;
                  _this.pageNo = 1;
                  if(M.globtab3btm){

                  }else{
                    $.attachInfiniteScroll($('.infinite-scroll'));
                  }
                  if(!M.globck3){
                      M.globck3 = true;
                      _this.reqdata();
                  } 
                });
            },
            bk:function(){
              var _this = this;          
              $('#tab1 .card-content').swipeLeft(function(){
                  $this = $(this).find(".h-plaintext");
                  $this.animate({
                      margin: '0 0 0 -3.75rem'
                  }, 500,'linear');
                  $this.siblings().animate({
                      right: '0'
                  }, 500,'linear');
                  $this.siblings().tap(function(){
                      _this.delete($this.parent());
                  })
              });

              $('#tab1 .card-content').swipeRight(function(){
                  $this = $(this).find(".h-plaintext");
                  $this.animate({
                      margin: '0'
                  }, 500,'ease-out');
                  $this.siblings().animate({
                      right: '-3.75rem'
                  }, 500,'ease-out');
              });
              //
              $('#tab2 #release-pic .re-list').tap(function(){
                  var id = $(this).attr("data-id");
                  var memberId = $(this).attr("data-memberId");
                  var postType = $(this).attr("data-postType");
                  window.location.href= "videoDetails.html?id="+id+"&postType="+postType;
              });
              $('#tab2 #release-pic .re-list').swipeLeft(function(){
                  $this = $(this);
                  $this.find(".h-plaintext").animate({
                      margin: '0 0 0 -3.75rem'
                  }, 500,'linear');
                  $this.siblings().animate({
                      right: '0'
                  }, 500,'linear');
                  $this.siblings().tap(function(){
                      _this.delete($this);
                  })
              });

              $('#tab2 #release-pic .re-list').swipeRight(function(){
                  $this = $(this);
                  $this.find(".h-plaintext").animate({
                      margin: '0'
                  }, 500,'ease-out');
                  $this.siblings().animate({
                      right: '-3.75rem'
                  }, 500,'ease-out');
              });
              //shipin
              $('#tab3 #release-shipin .re-list').tap(function(){
                  var id = $(this).attr("data-id");
                  var memberId = $(this).attr("data-memberId");
                  var postType = $(this).attr("data-postType");
                  window.location.href= "videoDetails.html?id="+id+"&postType="+postType;
              });
               $('#tab3 #release-shipin .re-list').swipeLeft(function(){
                  $this = $(this);
                  $this.find(".h-plaintext").animate({
                      margin: '0 0 0 -3.75rem'
                  }, 500,'linear');
                  $this.siblings().animate({
                      right: '0'
                  }, 500,'linear');
                  $this.siblings().tap(function(){
                      _this.delete($this);
                  })
              });

              $('#tab3 #release-shipin .re-list').swipeRight(function(){
                  $this = $(this);
                  $this.find(".h-plaintext").animate({
                      margin: '0'
                  }, 500,'ease-out');
                  $this.siblings().animate({
                      right: '-3.75rem'
                  }, 500,'ease-out');
              });
            },
            delete:function(dom){
                $.ajax({
                      type: 'post',
                      url: M.puburl+"/app/publish/delete",
                      data:{memberId:M.memberId,articleIds:dom.attr("data-id")},
                      dataType: 'json',
                      timeout: 3000,
                      success: function(data){
                        console.log(data);
                        if(data.code==0){
                          M.pageNo = 1;
                          M.reqdata(false);
                          $("body").dalutoast("删除成功");
                        }else{
                          $("body").dalutoast("未删除成功");
                        }
                         
                      },
                      error: function(xhr, type){
                        $("body").dalutoast('服务器开小差了～')
                        return false;
                      }
                })
            },
            reqdata:function(){
                  var url = this.puburl+'/app/publish/list';
                  var param = {postType:this.postType,memberId:this.memberId,pageNo:this.pageNo,pageSize:this.pageSize}
                  this.req(url,param);           
            },
            req: function(url,param){
                var _this = this;
                $.ajax({
                      type: 'post',
                      url: url,
                      data:param,
                      dataType: 'json',
                      timeout: 3000,
                      success: function(data){
                        _this.handle(data,false);
                      },
                      error: function(xhr, type){
                        $("body").dalutoast('服务器开小差了～')
                        return false;
                      }
                })
            },
            handle:function(data){
                var _this = this;
                data.picurl = this.picurl;
                if(data.code == 0){ 
                    if(_this.tab == "tab1"){
                      if(data.data.length==0){
                        //$("body").dalutoast("已无发布信息");
                      }else{
                        var html = template("release-wenziTpl",data);
                        $("#release-wenzi").html(html);
                        _this.bk();
                        _this.loading = false;
                      }
                    }else if(_this.tab == "tab2"){
                      if(data.data.length==0){
                        //$("body").dalutoast("已无发布信息");
                      }else{
                          var html = template("release-picTpl",data);
                          $("#release-pic").html(html);
                         _this.bk();
                         _this.loading = false;
                      } 
                    }else if(_this.tab == "tab3"){
                      if(data.data.length==0){
                        //$("body").dalutoast("已无发布信息");
                      }else{
                          var html = template("release-shipinTpl",data);
                          $("#release-shipin").html(html);
                          _this.bk();
                          _this.loading = false; 
                      }
                    }                      
                }     
            },
            handles:function(data){
                var _this = this;
                data.picurl = this.picurl;
                if(data.code == 0){ 
                    if(_this.tab == "tab1"){
                      if(data.data.length==0){
                        $("body").dalutoast("数据已完成");
                      }else{
                        var html = template("release-wenziTpl",data);
                        $("#release-wenzi").append(html);
                        _this.bk();
                        _this.loading = false;
                      }
                    }else if(_this.tab == "tab2"){
                      if(data.data.length==0){
                        $("body").dalutoast("数据已完成");
                      }else{
                          var html = template("release-picTpl",data);
                          $("#release-pic").append(html);
                         _this.bk();
                         _this.loading = false;
                      } 
                    }else if(_this.tab == "tab3"){
                      if(data.data.length==0){
                        $("body").dalutoast("数据已完成");
                      }else{
                          var html = template("release-shipinTpl",data);
                          $("#release-shipin").append(html);
                          _this.bk();
                          _this.loading = false; 
                      }
                    }                      
                }     
            },
            // 添加'refresh'监听器下拉刷新
            dropDown: function () {
                $(document).on('refresh', '.pull-to-refresh-content', function (e) {
                    $.attachInfiniteScroll($(".infinite-scroll"));
                    setTimeout(function(){
                        M.pageNo = 1;
                        M.reqdata();
                        $.pullToRefreshDone('.pull-to-refresh-content');
                    },1000);
                });
            },
            scroll:function(){
              $(document).on("pageInit", function() {
                $(document).on('infinite',function() {
                    // if(M.globtab!=M.tab){
                    //   M.globtab = M.tab;
                    //   return;
                    // }
                    if (M.loading) return;
                    M.loading = true;
                    $("#"+M.tab).find(".infinite-scroll-preloader").removeClass("hide");
                    var url = M.puburl+'/app/publish/list';
                    M.pageNo++;
                    var param = {postType:M.postType,memberId:M.memberId,pageNo:M.pageNo,pageSize:M.pageSize};
                    $.ajax({
                      type: 'post',
                      url: url,
                      data:param,
                      dataType: 'json',
                      timeout: 3000,
                      success: function(data){
                        M.handles(data);
                        M.loading = false;
                        if (data.data.length==0) {
                          if(M.tab == "tab1"){
                             M.globtab1btm = true;
                          }else if(M.tab == "tab2"){
                             M.globtab2btm = true;
                          }else if(M.tab == "tab3"){
                             M.globtab3btm = true;
                          }
                          // 加载完毕，则注销无限加载事件，以防不必要的加载
                          $.detachInfiniteScroll($('.infinite-scroll'));
                          // 删除加载提示符
                          $("#"+M.tab).find('.infinite-scroll-preloader').remove();
                          $("#"+M.tab).find(".mypreloader").removeClass("hide");
                        }
                        $.refreshScroller();
                      },
                      error: function(xhr, type){
                        $("body").dalutoast('服务器开小差了～')
                      }
                    })
                  })
               });
            }
        };
        
        M.init();
        $.init();
  })
})
