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
    'template': 'lib/template.min',
    'dsBridge':"lib/dsbridge"
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
require(['Zepto','template','sm','touch','ani','config','dsBridge'], function($,template) {
  $(function(){
    $(".backdiv").tap(function(){
        window.history.go(-1);
    });
    var isniming = 'no'; 
    var M = {
            puburl: localStorage.getItem("puburl"),
            memberId:localStorage.memberId,
            picurl:"",
            init: function(){
                this.change();
                this.bk();
            },
            bk:function(){
              var _this = this;       
              $("#collect-guanli").tap(function(){
                  if($(".toRel-niming").hasClass("know")){
                      isniming = 'yes';
                  }else{
                      isniming = 'no';
                  }
                  sessionStorage.setItem("sendTitle",$("input.toRel-titlecont").val());
                  sessionStorage.setItem("sendCont",$("textarea.toRel-areacont").val());
                  window.location.href = "sendTo.html?postType=3&&show=text&&isniming="+isniming;
              });
              $(".toRel-bottom1").tap(function(){
                if($(".toRel-niming").hasClass("know")){
                    isniming = 'yes';
                }else{
                    isniming = 'no';
                }
                sessionStorage.setItem("sendTitle",$("input.toRel-titlecont").val());
                sessionStorage.setItem("sendCont",$("textarea.toRel-areacont").val());
                  window.location.href = "toReleasePic.html?postType=3&&show=pic&&isniming="+isniming;
              });
              $(".toRel-bottom2").tap(function(){
                if($(".toRel-niming").hasClass("know")){
                    isniming = 'yes';
                }else{
                    isniming = 'no';
                }
                sessionStorage.setItem("sendTitle",$("input.toRel-titlecont").val());
                sessionStorage.setItem("sendCont",$("textarea.toRel-areacont").val());
                 window.location.href = "toReleasePic.html?postType=3&&show=video&&isniming="+isniming;
              })
              $(".toRel-niming").tap(function(){
                 if($(this).hasClass("know")){
                     $(this).removeClass("know");
                 }else{
                     $(this).addClass("know");
                 }
              })
            },
            change:function(){
                _this = this;
                var url = "http://192.168.0.102:8888/fileUpload/uploadImage";
                $(".toRel-uppiccont").tap(function(){
                     // $(".toRel-bottom").addClass("hide");
                     // $(".pro").removeClass("hide");
                     _this.chooseImage();
                })             
            },
            chooseImage:function() {
              dsBridge.call("compose.chooseImage","compose.hooseImage", function (data) {
                  $(".toRel-uppicbg").css("background-image", "url(./images/write_icon_addphoto.png)");
                  $.each(data,function(index,item){
                    $(".toRel-uppicbg").eq(index).css("background-image", "url(data:image/png;base64,"+item+")");
                  })
              })
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
                        console.log(data);
                        _this.handle(data,isScroll);
                      },
                      error: function(xhr, type){
                        $("body").dalutoast('服务器开小差了～');
                        return false;
                      }
                })
            },
            handle:function(data,isScroll){
                var _this = this;
                if(data.code == 0&& data.data.length>0){ 
                                        
                }
                
            }
        };
        
        M.init();
        $.init();
  })
})
