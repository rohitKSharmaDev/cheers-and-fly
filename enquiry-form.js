// validate contact form
$(function () {
  $('#enquiryForm').validate({
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
      }
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
        url: "enquiry-form-mailer.php",
        success: function () {
          $('#enquiryForm input').attr('disabled', 'disabled');
          $('#enquiryForm').fadeOut("slow", function () {
            $('#enquiry-form-success').fadeIn();
          });
        },
        error: function () {
          $('#enquiryForm').fadeOut("slow", function () {
            $('#enquiry-form-error').fadeIn();
          });
        }
      });
    }
  })
});