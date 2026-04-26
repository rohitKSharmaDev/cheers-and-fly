function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

let lastSubmitTime = 0;
const MIN_SUBMIT_INTERVAL = 5000;

let csrfToken = '';
fetch('/cheers-and-fly/get-csrf-token.php')
  .then(res => res.json())
  .then(data => {
    csrfToken = data.csrf_token;
    if ($('#enquiryForm input[name="csrf_token"]').length === 0) {
      $('#enquiryForm').append('<input type="hidden" name="csrf_token" value="' + sanitizeInput(csrfToken) + '">');
    }
  })
  .catch(err => console.error('CSRF fetch failed:', err));

$(document).ready(function () {
  // jQuery Validate
  $.validator.addMethod('phoneValidate', function (value) {
    return /^[0-9+\-\s()]{7,20}$/.test(value);
  }, 'Please enter a valid phone number');

  $('#enquiryForm').validate({
    rules: {
      name:       { required: true, minlength: 2, maxlength: 100 },
      email:      { required: true, email: true, maxlength: 254 },
      phone:      { required: true, phoneValidate: true },
      getQuoteOf: { required: true, maxlength: 100 },
      message:    { required: false, maxlength: 1000 }
    },
    messages: {
      name:       { required: 'Please enter your name', minlength: 'At least 2 characters required' },
      email:      { required: 'Please enter your email', email: 'Please enter a valid email' },
      phone:      { required: 'Please enter your phone number' },
      getQuoteOf: { required: 'Please select a package' }
    },
    errorPlacement: function (error, element) {
      error.addClass('uk-text-danger').css('font-size', '12px');
      const $label = element.closest('label');
      if ($label.length && $label.data('radio') === 'first') {
        error.insertAfter(element.closest('.uk-form-controls'));
      } else {
        error.insertAfter(element);
      }
    },
    highlight: function (element) {
      $(element).addClass('uk-form-danger');
    },
    unhighlight: function (element) {
      $(element).removeClass('uk-form-danger');
    },
    submitHandler: function (form) {
      const now = Date.now();
      if (now - lastSubmitTime < MIN_SUBMIT_INTERVAL) {
        UIkit.notification({
          message: '⏳ Please wait a few seconds before submitting again.',
          status: 'warning',
          pos: 'top-right',
          timeout: 3000
        });
        return false;
      }
      lastSubmitTime = now;

      $('input[name="csrf_token"]').val(sanitizeInput(csrfToken));

      // ✅ SERIALIZE FIRST before disabling fields
      const formData = $(form).serialize();

      const $btn    = $('#enquirySubmitBtn');
      const $fields = $('#enquiryForm input, #enquiryForm textarea, #enquiryForm select');

      // ✅ THEN disable fields
      $fields.prop('disabled', true);
      $btn.prop('disabled', true).html('<span uk-spinner="ratio: 0.6"></span> &nbsp;Sending...');

      $.ajax({
        url: '/cheers-and-fly/enquiry-form-mailer.php',
        type: 'POST',
        data: formData, // ✅ Uses pre-serialized data with all fields included
        dataType: 'json',
        success: function (response) {
          if (response.success) {
            UIkit.modal('#quick-enquiry-wrapper').hide();
            form.reset();

            // ✅ Vibrant Success Notification
            const $success = $('<div>').css({
              position:     'fixed',
              top:          '20px',
              right:        '20px',
              zIndex:       99999,
              background:   'linear-gradient(135deg, #00b09b, #96c93d)',
              color:        '#fff',
              padding:      '18px 24px',
              borderRadius: '10px',
              boxShadow:    '0 8px 30px rgba(0,176,155,0.5)',
              fontSize:     '15px',
              fontWeight:   '600',
              maxWidth:     '340px',
              lineHeight:   '1.5',
              display:      'flex',
              alignItems:   'center',
              gap:          '12px'
            }).html(`
              <span style="font-size:28px;">✅</span>
              <span>
                <strong style="display:block;font-size:16px;margin-bottom:4px;">Enquiry Sent!</strong>
                We've received your enquiry and will get back to you shortly.
              </span>
            `).appendTo('body');

            setTimeout(() => $success.fadeOut(400, function () { $(this).remove(); }), 6000);

          } else {

            // ✅ Vibrant Error Notification
            const $error = $('<div>').css({
              position:     'fixed',
              top:          '20px',
              right:        '20px',
              zIndex:       99999,
              background:   'linear-gradient(135deg, #f5365c, #f56036)',
              color:        '#fff',
              padding:      '18px 24px',
              borderRadius: '10px',
              boxShadow:    '0 8px 30px rgba(245,54,92,0.5)',
              fontSize:     '15px',
              fontWeight:   '600',
              maxWidth:     '340px',
              lineHeight:   '1.5',
              display:      'flex',
              alignItems:   'center',
              gap:          '12px'
            }).html(`
              <span style="font-size:28px;">❌</span>
              <span>
                <strong style="display:block;font-size:16px;margin-bottom:4px;">Submission Failed</strong>
                ${response.error || 'Something went wrong. Please try again.'}
              </span>
            `).appendTo('body');

            setTimeout(() => $error.fadeOut(400, function () { $(this).remove(); }), 6000);
          }
        },
        error: function (xhr) {
          console.error('AJAX Error:', xhr.responseText);

          // ✅ Vibrant AJAX Error Notification
          const $ajaxError = $('<div>').css({
            position:     'fixed',
            top:          '20px',
            right:        '20px',
            zIndex:       99999,
            background:   'linear-gradient(135deg, #f5365c, #f56036)',
            color:        '#fff',
            padding:      '18px 24px',
            borderRadius: '10px',
            boxShadow:    '0 8px 30px rgba(245,54,92,0.5)',
            fontSize:     '15px',
            fontWeight:   '600',
            maxWidth:     '340px',
            lineHeight:   '1.5',
            display:      'flex',
            alignItems:   'center',
            gap:          '12px'
          }).html(`
            <span style="font-size:28px;">⚠️</span>
            <span>
              <strong style="display:block;font-size:16px;margin-bottom:4px;">Server Error</strong>
              Failed to send enquiry. Please try again later.
            </span>
          `).appendTo('body');

          setTimeout(() => $ajaxError.fadeOut(400, function () { $(this).remove(); }), 6000);
        },
        complete: function () {
          // ✅ Re-enable ALL fields + button after response
          $fields.prop('disabled', false);
          $btn.prop('disabled', false).text('Send Enquiry');
        }
      });
    }
  });
});