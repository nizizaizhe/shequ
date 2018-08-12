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
require(['Zepto','template','sm','config','touch','ani'], function($,template) {
  $(function(){
    $(".backdiv").tap(function(){
        window.history.go(-1);
    });
    var puburl = localStorage.getItem("puburl");
    var id = getQueryString("id");
    function init(){
      $.ajax({
            type:'post',
            url: puburl+"//app/feedback/detail",
            data:{id:id},
            dataType: 'json',
            timeout: 3000,
            success: function(data){
              console.log(data);
              data.picurl = localStorage.getItem("picurl");
              data.imgUrl = data.data.imgUrl.split(",");
              var html = template("fankuiDetailTpl",data);
              $(".content").html(html);
            },
            error: function(xhr, type){
              $("body").dalutoast('服务器开小差了～')
              return false;
            }
      })
    };
    function getQueryString(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return unescape(r[2]); return null;
    };
    init();
    $.init();
  })
})
