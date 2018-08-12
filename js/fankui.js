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
    var pictureUpload = localStorage.getItem("pictureUpload");
    var M = {
            puburl: localStorage.getItem("puburl"),
            picurl: localStorage.getItem("picurl"),
            memberId:localStorage.memberId,
            pageNo:1,
            pageSize:10,
            loading :false,
            tab:"fankui",
            uploadpic:"",
            cking:false,
            init: function(){
              $(".fankui-area").attr("placeholder","请输入内容...");
                this.scroll();
                this.tabclick();
                this.change();
                this.bk();
                this.refresh();
            },
            refresh:function(){
                $(document).on('refresh', '.pull-to-refresh-content',function(e) {
                    _this.reqdata(false);
                    $.pullToRefreshDone('.pull-to-refresh-content'); 
                });  
            },
            tabclick:function(){
              _this = this;
                $(".fankui").tap(function(){
                   _this.tab = "fankui";
                });
                $(".jilu").tap(function(){
                    _this.tab = "jilu";
                    _this.pageNo = 1;
                    _this.reqdata(false);
                })
            },
            bk:function(){
              var _this = this;          
              $(".quit").tap(function(){
                  if(_this.cking) return false;
                  _this.cking = true;
                  var cont = $(".fankui-area").val();
                  var url = _this.puburl+"/app/feedback/save";
                  var data = {memberId:_this.memberId,content:cont,imgUrl:_this.uploadpic};
                  $.ajax({
                        url: url,
                        type: 'POST',
                        data: data,
                        dataType:"json",
                        success: function(data){  
                            _this.cking = false;
                            if(data.code==0){
                              $(".fankui").removeClass("active");
                              $("#tab1").removeClass("active");
                              $(".jilu").addClass("active");
                              $("#tab2").addClass("active");
                              _this.tab = "jilu";
                              _this.pageNo = 1;
                              _this.reqdata(false);
                              $("body").dalutoast("提交成功");  
                            }else{
                              $("body").dalutoast(data.message);  
                            }             
                        },
                        error: function(xhr, type){
                            _this.cking = false;
                            $("body").dalutoast('服务器开小差了～')
                           return false;
                        }
                  })
              });
              $("li.h-card").tap(function(){
                  var id = $(this).attr("data-id");
                  window.location.href = "fankuiDetail.html?id="+id;
              })
            },
            change:function(){
                _this = this;
                var url = pictureUpload+"/fileUpload/uploadImage";
                document.getElementById("upload").addEventListener("change", function(e){
                    var formData = new FormData();
                    var files = document.querySelector("#upload").files;
                    var i=0;
                    while (i < files.length) {
                        var file = files[i]; 
                        formData.append('file',file);
                        i++;
                    }  
                    //formData.append('file', $('#upload')[0].files[0]);
                    $.ajax({
                        url: url,
                        type: 'POST',
                        cache: false,
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function(data){ 
                            if(data.code == 0&& data.url!=""){
                                _this.uploadpic = data.url; 
                                var arr = data.url.split(",");
                                $(".fankuipic").addClass("hide");
                                $.each(arr,function(index,item){
                                  $(".fankuipic").eq(index).removeClass("hide");
                                  $(".fankuipic").eq(index).attr("src",_this.picurl+item);
                                });                        
                            }                
                        },
                        error: function(xhr, type){
                            $("body").dalutoast('服务器开小差了～')
                            return false;
                        }
                    })
     
                });
            },
            reqdata:function(isScroll){
                  var url = this.puburl+'/app/feedback/list';
                  var param = {memberId:this.memberId,pageNo:this.pageNo++,pageSize:this.pageSize}
                  this.req(url,param,isScroll);           
            },
            req: function(url,param,isScroll){
                var _this = this;
                $.ajax({
                      type: 'post',
                      url: url,
                      data:param,
                      dataType: 'json',
                      timeout: 3000,
                      success: function(data){
                        if(isScroll){
                          $.detachInfiniteScroll($('.infinite-scroll'));
                          // 删除加载提示符
                          $('.infinite-scroll-preloader').remove();
                          $(".mypreloader").removeClass("hide");
                        }
                        _this.handle(data,isScroll);
                      },
                      error: function(xhr, type){
                        $("body").dalutoast('服务器开小差了～')
                        return false;
                      }
                })
            },
            handle:function(data,isScroll){
                var _this = this;
                data.puburl = this.puburl;
                if(data.code == 0&& data.data.length>0){ 
                      var html = template("withdw-ulTpl2",data);
                      isScroll ? $("#withdw-ul2").append(html) : $("#withdw-ul2").html(html);
                      _this.loading = false;  
                      _this.bk();                       
                }
                
            },
            scroll:function(){
                var _this = this;
                $(document).on('infinite', '.infinite-scroll-bottom',function() {
                    if (_this.loading) return;
                    $(".infinite-scroll-preloader").removeClass("hide");
                    _this.loading = true;
                    _this.reqdata(true);
                })
            }
        };
        
        M.init();
        $.init();
  })
})
