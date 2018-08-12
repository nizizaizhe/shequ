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
    var postType = getQueryString("postType");
    var sendTitle = sessionStorage.getItem("sendTitle");
    var sendCont = sessionStorage.getItem("sendCont");//发布的文字内容
    function getQueryString(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return unescape(r[2]); return null;
    };
    function chooseImage() {
      var bgckHtml = '<div class="toRel-uppicbgck"><img src="./images/jia12@2x.png"></div>';
          $("#addPic").html(bgckHtml); 
      //alert(sessionStorage.getItem("choosePic"));
      dsBridge.call("compose.chooseImage","compose.chooseImage", function (data) {
          $(".toRel-uppicbg img").attr("src", "");
          $(".toRel-upvideobg img").attr("src", "");
          var bgckHtml = '<div class="toRel-uppicbgck"><img src="./images/jia12@2x.png"></div>';
          $("#addPic").html(bgckHtml);                  
          data = data.replace(/\s+/g,"");
          sessionStorage.setItem("choosePic",data);
          data = data.split(",");
          $.each(data,function(index,item){
            //$(".toRel-uppicbg").eq(index).find("img").attr("src", "data:image/png;base64,"+item);
            var html = template("addPicTpl",{"addurl":item});
            $("#addPic").append(html);
          })
      })
    };
    function chooseVideo() {
      dsBridge.call("compose.chooseVideo","compose.chooseVideo", function (data) {
          $(".toRel-uppicbg img").attr("src", "");
          $(".toRel-upvideobg img").attr("src", "");
          var bgckHtml = '<div class="toRel-upvideobgck"><img src="./images/jia12@2x.png"></div>';
          $("#addVideo").html(bgckHtml);
          //保存选取的图片
          data = data.replace(/\s+/g,"");
          sessionStorage.setItem("chooseV",data);
          data = data.split(",");
          $.each(data,function(index,item){
            //$(".toRel-upvideobg").eq(index).find("img").attr("src", "data:image/png;base64,"+item);
            var html = template("addVideoTpl",{"addurl":item});
            $("#addVideo").append(html);
          })
      })
    };
    if(postType == 1){
      $(".toRel-area").addClass("height235");
      $(".toRel-title").removeClass("hide");
      $(".tupian").removeClass("hide");
      $(".shipin").addClass("hide");
      $(".toRel-uppicbg img").attr("src", "");
      $(".toRel-upvideobg img").attr("src", "");
      $(".toRel-uppicbgck").tap(function(){
        sessionStorage.setItem("choosePic","");
        chooseImage();
      })
    }else if(postType == 2){
      $(".toRel-area").addClass("height235");
      $(".toRel-title").removeClass("hide");
      $(".tupian").addClass("hide");
      $(".shipin").removeClass("hide");
      $(".toRel-uppicbg img").attr("src", "");
      $(".toRel-upvideobg img").attr("src", "");
      $(".toRel-upvideobgck").tap(function(){
        sessionStorage.setItem("chooseV","");
          chooseVideo();
      })
      // 视频
    }else if(postType == 3){
      //alert(3);
      $(".toRel-area").removeClass("height235");
      $(".toRel-title").removeClass("hide");
      $(".toRel-areacont").removeClass("hide");    
      var show = getQueryString("show");
      $(".toRel-titlecont").val(sendTitle);
      $(".toRel-areacont").val(sendCont);
      if(show == "pic"){
        $(".tupian").removeClass("hide");
        $(".shipin").addClass("hide");
        $(".toRel-uppicbg img").attr("src", "");
        $(".toRel-upvideobg img").attr("src", "");
        $(".toRel-uppicbgck").tap(function(){
            sessionStorage.setItem("choosePic","");
            chooseImage();
        })
      }else{
        $(".tupian").addClass("hide");
        $(".shipin").removeClass("hide");
        $(".toRel-uppicbg img").attr("src", "");
        $(".toRel-upvideobg img").attr("src", "");
        $(".toRel-upvideobgck").tap(function(){
           sessionStorage.setItem("chooseV","");
            chooseVideo();
        })
      }
    }
    var M = {
            postType:"",
            show:"",
            isniming:'no',
            init: function(){
                var _this = this;
                sessionStorage.setItem("choosePic","");
                sessionStorage.setItem("chooseV","");
                this.postType = this.getQueryString("postType");
                this.show = this.getQueryString("show");
                this.bk();
                if(this.getQueryString("isniming") == "yes"){
                    M.isniming = 'yes';
                    $(".toRel-niming").addClass("know");
                }else{
                    M.isniming = 'no';
                    $(".toRel-niming").removeClass("know");
                }
                //$("body").dalutoast("postType:"+postType);
            },
            bk:function(){
              var _this = this;          
              $("#collect-guanli").tap(function(){
                  if(_this.postType == 3){
                      sessionStorage.setItem("sendTitle",$("input.toRel-titlecont").val());
                      sessionStorage.setItem("sendCont",$("textarea.toRel-areacont").val());
                      var chooseImg = sessionStorage.getItem("choosePic");
                      var chooseV = sessionStorage.getItem("chooseV");
                      var title = sessionStorage.getItem("sendTitle");
                      var show = M.getQueryString("show");
                      if(show == "pic"){
                        if(chooseImg == "" || chooseImg == null||chooseImg == "null"||chooseImg == undefined||chooseImg == "undefined"){
                          $("body").dalutoast("请选择图片");
                          return false;
                        }  
                      }else{
                        if(chooseV == "" || chooseV == null||chooseV == "null"||chooseV == undefined||chooseV == "undefined"){
                          $("body").dalutoast("请选择视频");
                          return false;
                        } 
                      }
                      
                      if(title == "" || title == null||title == "null"||title == undefined||title == "undefined"){
                        $("body").dalutoast("请输入标题");
                          return false;
                      }
                      window.location.href = "sendTo.html?postType="+_this.postType+"&&show="+_this.show +"&&isniming="+M.isniming;
                  }else{
                      sessionStorage.setItem("sendTitle",$("input.toRel-titlecont").val());
                      sessionStorage.setItem("sendCont","");
                      var chooseImg = sessionStorage.getItem("choosePic");
                      var chooseV = sessionStorage.getItem("chooseV");
                      var title = sessionStorage.getItem("sendTitle");
                      if(M.postType == 1){
                        if(chooseImg == "" || chooseImg == null||chooseImg == "null"||chooseImg == undefined||chooseImg == "undefined"){
                          $("body").dalutoast("请选择图片");
                          return false;
                        }  
                      }else{
                        if(chooseV == "" || chooseV == null||chooseV == "null"||chooseV == undefined||chooseV == "undefined"){
                          $("body").dalutoast("请选择视频");
                          return false;
                        } 
                      }
                      if(title == "" || title == null||title == "null"||title == undefined||title == "undefined"){
                        $("body").dalutoast("请输入标题");
                          return false;
                      }
                      window.location.href = "sendTo.html?postType="+_this.postType+"&&show="+_this.show+"&&isniming="+M.isniming;
                  } 
              });
              $(".toRel-niming").tap(function(){
                 if($(this).hasClass("know")){
                     $(this).removeClass("know");
                     M.isniming = 'no';
                 }else{
                     $(this).addClass("know");
                     M.isniming = 'yes';
                 }
              });
              // $(".toRel-bottom1").tap(function(){
              //     sessionStorage.setItem("sendTitle",$("input.toRel-titlecont").val());
              //     sessionStorage.setItem("sendCont",$("textarea.toRel-areacont").val());
              //     window.location.href = "toReleasePic.html?postType=3&&show=pic";
              // });
              // $(".toRel-bottom2").tap(function(){
              //    sessionStorage.setItem("sendTitle",$("input.toRel-titlecont").val());
              //     sessionStorage.setItem("sendCont",$("textarea.toRel-areacont").val());
              //    window.location.href = "toReleasePic.html?postType=3&&show=video";
              // })
            },
            getQueryString:function (name) {
              var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
              var r = window.location.search.substr(1).match(reg);
              if (r != null) return unescape(r[2]); return null;
            }
        };
        
        M.init();
        $.init();
  })
})
