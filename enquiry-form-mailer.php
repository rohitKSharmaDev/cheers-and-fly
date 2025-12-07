<?php

    $from =  "sales@cheersandfly.com";
    
    $name = $_REQUEST['name'];
    $email = $_REQUEST['email'];
    $tel = $_REQUEST['phone'];
    $quoteFor = $_REQUEST['getQuoteOf'];
    
    $to = 'srrexsharma@gmail.com, info@cheersandfly.com';

    $headers = "From: $from";
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: $from\n";
    /*$headers .= "Cc: $email\n ";*/
    $headers .= "Reply-To: $email";
    
    $subject = "You have received a new travel enquiry from Cheers and Fly Website";
   
    $htmlContent = file_get_contents('enquiry-email-template.html');
    $htmlContent = str_replace('{{name}}', $name, $htmlContent);
    $htmlContent = str_replace('{{email}}', $email, $htmlContent);
    $htmlContent = str_replace('{{phone}}', $tel, $htmlContent);
    $htmlContent = str_replace('{{getQuoteOf}}', $quoteFor, $htmlContent);
	
    mail($to, $subject, $htmlContent, $headers);

?>