const assetPath = (function () {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const depth = parts.length - 2;
  return depth <= 0 ? 'assets/' : '../'.repeat(depth) + 'assets/';
})();

document.body.insertAdjacentHTML('afterbegin', `
  <div id="loadingDiv">
    <img src="${assetPath}images/logo-navbar.png" alt="Cheers and Fly Vacations Logo" style="width:160px;margin-bottom:16px;">
    <span class="loading-txt">Loading...</span>
    <div class="loader"><span></span></div>
  </div>
`);

const $pageArea = document.getElementById('page-area');
if ($pageArea) $pageArea.style.display = 'none';

$(window).on('load', function () {
  $('#page-area').css({ display: 'block' });
  $('#loadingDiv').fadeOut(1000, function () {
    $(this).remove();
  });
});

$(function () {
  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 150) {
      $('.back-top').fadeIn();
      $('.common-quick-enquiry-icon').css({ display: 'flex' });
    } else {
      $('.back-top').fadeOut();
      $('.common-quick-enquiry-icon').css({ display: 'none' });
    }
  });
});

const homeAboutSectionReadMoreCta = document.getElementById('about-section-home-read-more-cta');

homeAboutSectionReadMoreCta.addEventListener('click', function () {
  window.location.href = 'about-us.html';
});