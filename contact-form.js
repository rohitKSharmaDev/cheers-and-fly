// validate contact form
$(function () {
  $('#contactForm').validate({
    rules: {
      name: {
          required: true,
          minlength: 5
      },
      email: {
          required: true,
          email: true
      },
      phone: {
          required: true,
          minlength: 10,
          maxlength: 12
      },
    },
    messages: {
      name:{
          required: "Name is required.",
      },
      email: {
          required: "Email Id is required.",
          email: "Please enter a correct email id."
      },
      phone: {
          required: "Enter your mobile number."
      },
    },
    submitHandler: function (form) {
      $(form).ajaxSubmit({
        type: "POST",
        data: $(form).serialize(),
        url: "contact-form-mailer.php",
        success: function () {
          $('#contactForm input').attr('disabled', 'disabled');
          $('#contactForm').fadeOut("slow", function () {
            $('#contact-form-success').fadeIn();
          });
        },
        error: function () {
          $('#contactForm').fadeOut("slow", function () {
            $('#contact-form-error').fadeIn();
          });
        }
      });
    }
  })
});