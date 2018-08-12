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
    'template': 'lib/template.min'
  },
  shim: {
    'Zepto':{exports:'Zepto'},
    'touch':{deps:['Zepto']},
    'ani':{deps:['Zepto']},
    'sm':{
      deps: ['Zepto']
    }
  }
});
require(['Zepto','template','sm','touch','ani'], function($,template) {
  $(function(){
       $(".backdiv").click(function(){
          window.history.go(-1);
       });
        var puburl = localStorage.getItem("puburl");
        var picurl = localStorage.getItem("picurl");
        var memberId = localStorage.memberId;
        var pageNo = 0;
        var pageSize = 10;
        var loading = false;
        var quanjudata = "";
        function init(){
          if($.device.osVersion == "10.3.3"){
              $(".content").css("bottom","2.2rem");
           }else{
              $(".content").css("bottom","0");
           }
          // alert($.device.osVersion);
          //  alert($.device.osVersion == "10.3.3");
            $("#collect-guanli").text("管理");
            $(".collect-btm").addClass("hide");
            $.ajax({
                  type:'post',
                  url: puburl+"/app/favor/list",
                  data:{memberId:memberId,pageNo:1,pageSize:10},
                  dataType: 'json',
                  timeout: 3000,
                  success: function(data){
                    quanjudata = data;
                    data.picurl = picurl;
                    var html = template("collectTpl",data);
                    $("#collect").html(html);
                    bk();
                  },
                  error: function(xhr, type){
                    $("body").dalutoast('服务器开小差了～')
                        return false;
                  }
            })
        };
        //点击管理
        $("#collect-guanli").tap(function(e){
            if($(this).html()==="管理"){
               if(quanjudata == "" || quanjudata.data.length==0){
                  $("body").dalutoast("无数据");
                  return false;
               }
               $(this).html("取消管理");
               if($.device.osVersion == "10.3.3"){
                  $(".content").css("bottom","4.2rem");
                  $(".collect-btm").css("bottom","2.2rem");
               }else{
                  $(".content").css("bottom","2.2rem");
                  $(".collect-btm").css("bottom","0");
               }
               
            }else{
              $(this).html("管理");
              $(".content").css("bottom","0");
              $(".collect-btm").css("bottom","0");
            }
            if($(this).html()==="取消管理"){
              $(".collect-btm").removeClass("hide");
              $(".collect-check").removeClass("hide");
              $("i.collect-check").removeClass("collect-checkok");
              $('.collect-btmone').removeClass("collect-btmoneok");
              $("#collect-btmtwo").css("background","grey");
            }else{
              $(".collect-btm").addClass("hide");
              $(".collect-check").addClass("hide");
              $("i.collect-check").removeClass("collect-checkok");
              $('.collect-btmone').removeClass("collect-btmoneok");
              $("#collect-btmtwo").css("background","grey");
            }
        });
        var cking = false;
        //点击取消收藏
        $("#collect-btmtwo").tap(function(){
            //var articleIds = "";
            var label ="";
            var test = "";
            $("li.h-plaintext").each(function(){
                if($(this).find("i.collect-check").hasClass("collect-checkok")){
                    //var str = "&articleIds=" + $(this).attr("data-id");
                    var teststr = $(this).attr("data-id")+",";
                    test += teststr;
                    label += $(this).attr("data-id");
                    //articleIds += str;
                }
            }); 

            if(label==""){
              return false;
            }
            if(cking){
              return false;
            }
            cking = true;
            //var url = puburl+"/app/favor/delete?memberId="+memberId+articleIds;
            test = test.substring(0,test.length-1);
            var url = puburl+"/app/favor/delete?memberId="+memberId+"&articleIds="+test;
            $.ajax({
                type:'get',
                url: url,
                dataType: 'json',
                timeout: 6000,
                traditional: true, 
                success: function(data){
                  console.log(data);
                  cking = false;
                  if(data.code==0){
                    init();
                    $("body").dalutoast("取消成功");
                  }else{
                    $("body").dalutoast("取消未成功");
                  }               
                },
                error: function(xhr, type){
                  $("body").dalutoast('服务器开小差了～')
                        return false;
                }
            })
        });
        function bk(){  
            //点击全选
            $('#collect-btmone').tap(function(){
                if($(this).hasClass("collect-btmoneok")){
                  //取消全选
                    $(this).removeClass("collect-btmoneok");
                    $("i.collect-check").removeClass("collect-checkok")
                    $("#collect-btmtwo").css("background","grey")
                }else{
                  //去选
                    $(this).addClass("collect-btmoneok");
                    $("i.collect-check").addClass("collect-checkok")
                    $("#collect-btmtwo").css("background","#fe2222")
                }
                
            });
            //单个选择
            $('li.h-plaintext').tap(function(){
                if($("#collect-guanli").html()==="管理"){
                    var id= $(this).attr("data-id");
                    var postType = $(this).attr("data-postType");
                    location.href = "videoDetails.html?id="+id+"&postType="+postType;
                }else{
                    ////进行管理的操作开始
                    if($(this).find("i.collect-check").hasClass("collect-checkok")){
                        //取消单选
                        $(this).find("i.collect-check").removeClass("collect-checkok");
                        $('.collect-btmone').removeClass("collect-btmoneok");
                        //是否别的选项有选中的
                        if($("i.collect-check").hasClass("collect-checkok")){
                          $("#collect-btmtwo").css("background","#fe2222")
                        }else{
                          $("#collect-btmtwo").css("background","grey");
                        }
                        
                    }else{
                      //进行单选
                        $(this).find("i.collect-check").addClass("collect-checkok");
                        var isAllChosee = 1;//默认1未全部选中
                        //判断此次单选后是否所有的都选中了，0表示选中，1表示未选中
                        $('i.collect-check').each(function(){
                           $(this).hasClass("collect-checkok");
                           var num;
                           if($(this).hasClass("collect-checkok")){
                               num = 0;  
                           }else{
                               num = 1;
                           }
                            switch (num)
                            {
                            case 0:
                              isAllChosee = 0;                  
                              break;
                            case 1:
                              isAllChosee = 1;              
                              break;
                            }
                            if(isAllChosee == 1){
                               return false;
                            }
                        });

                        if(isAllChosee == 0){
                          $('.collect-btmone').addClass("collect-btmoneok");
                        }
                        $("#collect-btmtwo").css("background","#fe2222")
                    } 
                    ////进行管理的操作结束
                }
                         
            });//dan ge xuan ze
          }
    init();
    $.init();
  })
})
