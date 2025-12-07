$('body').append('<div id="loadingDiv"><img src="assets/images/logo-navbar.png" alt="Cheers and Fly Vacations Logo"><span class="loading-txt">Loading...</span><div class="loader"><span></span></div></div>');
$('#page-area').css({ 'display': 'none' });
$(window).on('load', function () {
  setTimeout(removeLoader, 2000); //wait for page load PLUS two seconds.
});

function removeLoader() {
  $('#page-area').css({ 'display': 'block' });
  $("#loadingDiv").fadeOut(500, function () {
    $("#loadingDiv").remove();
  });
}

$(function () {
  $(window).scroll(function () {
    if ($(this).scrollTop() > 150) {
      $('.back-top').fadeIn();
      $('.common-quick-enquiry-icon').css({ 'display': 'flex' });
    } else {
      $('.back-top').fadeOut();
      $('.common-quick-enquiry-icon').css({ 'display': 'none' });
    }
  });
});