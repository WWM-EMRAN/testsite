
/**
* Copy to clipboard function #wwm.emran
*/
function CopyToClipboard(containerid) {
    ClearSelection()

    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerid));
        range.select().createTextRange();
        document.execCommand("copy");
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(document.getElementById(containerid));
        window.getSelection().addRange(range);
        document.execCommand("copy");
        // alert("Text has been copied, now paste in the text-area")
    }
}

function ClearSelection()
{
    if (window.getSelection) {window.getSelection().removeAllRanges();}
    else if (document.selection) {document.selection.empty();}
}


function SendEmail()
{
    alert("This will open your default email client on your computer. Sorry if you don't have one, please use the email to contact manually.");
    var name =  document.getElementById('name').value;
    var email =  document.getElementById('email').value;
    var subject =  document.getElementById('subject').value;
    var message =  document.getElementById('message').value;
    var sub = encodeURIComponent("Email from "+name+" ("+email+") - "+subject);
    var bod = encodeURIComponent("Contact message:\n=======================================================\n\n"+message+"\n\n"+name+"\n"+email);

    var all = sub+bod;
    // alert(all);
    document.location = "mailto:emran.ali@research.deakin.edu.au?from="+email+"&subject="+sub+"&body="+bod;
}


function PrintElem(elem)
{
    var mywindow = window.open('', 'PRINT', 'height=400,width=600');

    mywindow.document.write('<html><head><title>' + document.title  + '</title>');
    mywindow.document.write('</head><body >');
    mywindow.document.write('<h1>' + document.title  + '</h1>');
    mywindow.document.write(document.getElementById(elem).innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    mywindow.close();

    return true;
}


function DownloadFile(elem, url)
{
    document.getElementById(elem).src = url;
}



// $(function () {
//     $('.SendEmail').click(function (event) {
//     var name =  'name'; //document.getElementById(containerid) //
//     var email = 'sample@gmail.com';
//     var subject = 'Test';
//     var emailBody = 'Hi Sample,';
//     document.location = "mailto:emran.ali@research.deakin.edu.au?from="+email+"&subject="+subject+"&body="+emailBody;
//     // document.location = "mailto:"+email+"?subject="+subject+"&body="+emailBody+ "?attach="+attach;
//     });
// });


////////// Portfolio / Diary swipe
// // const swiperElement = document.querySelector('.portfolio-details-slider.swiper.init-swiper');
// const swiperElement = document.querySelector('.photo-slide');
//
// // If a configuration is provided inside the element, parse and initialize Swiper
// if (swiperElement) {
//     const configElement = swiperElement.querySelector('.swiper-config');
//     const swiperConfig = JSON.parse(configElement.textContent);
//
//     // Initialize Swiper with the configuration
//     new Swiper(swiperElement, swiperConfig);
// }

// MODIFIED: extra_functions.js (Around line 104)
////////// Portfolio / Diary swipe
// const swiperElement = document.querySelector('.portfolio-details-slider.swiper.init-swiper');
const swiperElement = document.querySelector('.photo-slide');

// If the Swiper element is found, attempt to initialize it safely.
if (swiperElement) {
    const configElement = swiperElement.querySelector('.swiper-config');

    // CRITICAL FIX: Check if the configuration element exists before trying to parse its content
    if (configElement) {
        try {
            // Added try...catch for safety in case JSON parsing fails
            const swiperConfig = JSON.parse(configElement.textContent);
            // Initialize Swiper with the configuration
            new Swiper(swiperElement, swiperConfig);
        } catch (e) {
            console.error("Error parsing Swiper configuration JSON:", e);
        }
    }
}


// ///////////////// For background change //////////////////
// document.addEventListener("DOMContentLoaded", () => {
//     // const heroImage = document.querySelector('img[data-aos="fade-in"]');
//     const heroImage = document.querySelector('.hero-bg-image');
//     const imageListContainer = document.querySelector('.image-list');
//
//     // Retrieve the image paths from the spans in the image-list div
//     const images = Array.from(imageListContainer.querySelectorAll('span')).map(span => span.textContent.trim());
//
//     let currentIndex = 0;
//
//     // Function to change the image with a smooth transition
//     function changeImage() {
//         heroImage.style.opacity = 0; // Fade out the current image
//
//         setTimeout(() => {
//             currentIndex = (currentIndex + 1) % images.length;
//             heroImage.src = images[currentIndex]; // Change the image source
//             heroImage.style.opacity = 1; // Fade in the new image
//         }, 750); // Wait for the fade-out transition duration
//     }
//
//     // Change image every 10 seconds
//     setInterval(changeImage, 10000);
// });


// MODIFIED: extra_functions.js (Starting around line 125)
///////////////// For background change //////////////////
document.addEventListener("DOMContentLoaded", () => {
    // const heroImage = document.querySelector('img[data-aos="fade-in"]');
    const heroImage = document.querySelector('.hero-bg-image');
    const imageListContainer = document.querySelector('.image-list');

    // CRITICAL FIX: Only run background change logic if required elements exist
    if (heroImage && imageListContainer) {
        // Retrieve the image paths from the spans in the image-list div
        const images = Array.from(imageListContainer.querySelectorAll('span')).map(span => span.textContent.trim());

        let currentIndex = 0;

        // Function to change the image with a smooth transition
        function changeImage() {
            heroImage.style.opacity = 0; // Fade out the current image

            setTimeout(() => {
                currentIndex = (currentIndex + 1) % images.length;
                heroImage.src = images[currentIndex]; // Change the image source
                heroImage.style.opacity = 1; // Fade in the new image
            }, 750); // Wait for the fade-out transition duration
        }

        // Change image every 10 seconds
        setInterval(changeImage, 10000);
    }
});







