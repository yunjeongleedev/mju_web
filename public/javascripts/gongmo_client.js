$(function() {
    $('.gongmo-like-btn').click(function(e) {
      var $el = $(e.currentTarget);
      if ($el.hasClass('loading')) return;
      $el.addClass('loading');
      $.ajax({
        url: '/api/gongmos/' + $el.data('id') + '/like',
        method: 'POST',
        dataType: 'json',
        success: function(data) {
          $('.gongmo .num-likes').text(data.numLikes);
          $('.gongmo-like-btn').hide();
        },
        error: function(data, status) {
          if (data.status == 401) {
            alert('Login required!');
            location = '/signin';
          }
          console.log(data, status);
        },
        complete: function(data) {
          $el.removeClass('loading');
        }
      });
    });

  }); 