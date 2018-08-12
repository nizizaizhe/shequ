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
    $(".backdiv").tap(function(){
        window.history.go(-1);
     });
    $(document).on("pageInit", "#page-ptr", function(e, id, page) {
        //点击管理
        $("#collect-guanli").tap(function(e){
            if($(".collect-btm").hasClass("hide")){
                $(".collect-btm").removeClass("hide");
                $(".collect-check").removeClass("hide");
                $(".h-plaintext").animate({
                  padding: '0 .75rem 0 1.25rem'
                }, 500,'linear');
                $(".offlineCont").animate({
                  bottom: '2.2rem'
                }, 500,'linear');
            }else{
                $(".collect-btm").addClass("hide");
                $(".collect-check").addClass("hide");
                $(".h-plaintext").animate({
                  padding: '0 .75rem 0 .75rem'
                }, 500,'linear');
                $(".offlineCont").animate({
                  bottom: '0'
                }, 500,'linear');
            }
        });
        //点击全选
        $('.collect-btmone').tap(function(){
            if($(this).hasClass("collect-btmoneok")){
              //取消全选
                $(this).removeClass("collect-btmoneok");
                $("i.collect-check").removeClass("collect-checkok")
            }else{
              //去选
                $(this).addClass("collect-btmoneok");
                $("i.collect-check").addClass("collect-checkok")
            }
            
        });
        //单个选择
        $('li.h-plaintext').tap(function(){
            if($(this).find("i.collect-check").hasClass("collect-checkok")){
              //取消单选
                $(this).find("i.collect-check").removeClass("collect-checkok");
                $('.collect-btmone').removeClass("collect-btmoneok");
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
            }          
        });

    });
    $.init();
  })
})
