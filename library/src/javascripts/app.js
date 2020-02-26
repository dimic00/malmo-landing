'use strict';

global.jQuery = require('jquery');
const $ = jQuery;

const nonGlobal = jQuery.noConflict(true);
module.exports = nonGlobal;

// const slick = require('slick-carousel');
// const svgxuse = require('svgxuse');
const Cookies = require('js-cookie');
// const modernizr = require('./bundles/modernizr-custom.js');

$(document).ready(() => {
	// Fallback pour l'object-fit
	// Utiliser la classe "of" sur le container de l'image � object-fit
	/* if ( ! Modernizr.objectfit ) {
$('.of').each(function () {
var $container = $(this),
imgUrl = $container.find('img').prop('src');
if (imgUrl) {
$container
.css('backgroundImage', 'url(' + imgUrl + ')')
.addClass('of-fallback');
}
});
} */

	// Bandeau cookie
	const cookieName = "cookieInfos_WEBSITE-NAME";
	const cookieInfos = Cookies.get(cookieName);

	if (cookieInfos !== "true") {
		$("#cookies").addClass("visible");
	}

	$("#cookiesClose").click(function() {
		Cookies.set(cookieName, "true", { expires: 180 });

		$("#cookies").fadeOut("400", function() {
		$("#cookies").removeClass("visible");
		});
	});
});
