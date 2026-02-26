/**
 * @file
 * Global utilities.
 *
 */
(function (Drupal, $) {

  'use strict';

  Drupal.behaviors.acs_gcs = {
    attach: function (context, settings) {
      const searchBlock = document.querySelector('#block-skvare-custom-bootstrap-globalesearchformenu')?.outerHTML || '';
      $('.field--type-address-country h4').addClass('js-form-required form-required');
      $('.form-item-field-testa-0-value label').addClass('js-form-required form-required');
      window.addEventListener('scroll', function () {
        const fadeElement = document.querySelector('.fade-element');
        if (!fadeElement) return;

        const elementPosition = fadeElement.getBoundingClientRect().top;
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;

        // Calculate opacity based on scroll position relative to the element
        const distanceToElement = elementPosition - scrollPosition;
        const opacity = (distanceToElement / windowHeight) + 0.3;

        // Set opacity within range [0, 1]
        fadeElement.style.opacity = Math.max(0, Math.min(opacity, 1));
      });

      window.addEventListener('load', function () {
        var top_links = document.getElementsByClassName("tbm-link level-1");

        var menu = `
        <style>
            h3{
                font-weight:bold;
            }
            .navmenu-item-div{
                width:100%;
                text-align:center;
                color:#090238;
            }
            .navbar-item-button{
                background-color:#090238;
                width:33%;
                color:white;
                margin-top:20px;
                border-radius:20px;
                overflow:hidden;
                padding-top:10px;
                padding-bottom:10px;
            }
            a{
                text-decoration:none
            }
        </style>
        <div>
        `

        let i = 0;
        let btnState = true;
        let btnData = `
        <div class="navmenu-item-div">
          <div>
              <button class="navbar-item-button" onclick="location.href='/user/login'" type="button">
                  Log In
              </button>
          </div>
          <div>
              <button class="navbar-item-button" onclick="location.href='/form/user-registration'" type="button">
                  Sign Up
              </button>
          </div>
        </div>`;

        while (i < top_links.length) {
          menu += '<div class="navmenu-item-div"><h3>'
          if(top_links[i].text === undefined){
            if(top_links[i].textContent){
              btnState = false;
            }
            menu += '<a href="#">' + top_links[i].textContent + '</a>';
            
          }else{
            menu += '<a href="' + top_links[i] + '">' + top_links[i].text + '</a>';
          }
          menu += '</h3></div>';
          var sub_items = top_links[i].parentElement.parentElement.querySelectorAll('a.level-2')
          let j = 0;
          while (j < sub_items.length) {
            menu += '<div class="navmenu-item-div">'
            menu += '<a href="' + sub_items[j] + '">' + sub_items[j].text + '</a>';
            menu += '</div>';
            j++;
          }
          menu += '</br>';
          i++;
        }

        menu += searchBlock;
        menu += btnState ? `${btnData}</div>`:`</div>`;

        let nav_div = document.getElementById('CollapsingNavbar');
        let nav_bar_icon = document.getElementsByClassName('navbar-toggler')[0];
        var collapsed = true;
        nav_bar_icon.onclick = function () {
          if (!collapsed) {
            nav_div.style.setProperty('display', 'none', 'important');
            nav_div.style.setProperty('justify-content', 'space-between', 'important');
            nav_div.classList.remove("navbar-responsive")
            nav_bar_icon.classList.add("collapsed");
            nav_div.innerHTML = '';
          } else {
            nav_div.style.setProperty('display', 'flex', 'important');
            nav_div.style.setProperty('justify-content', 'center', 'important');
            nav_div.classList.add("navbar-responsive")
            nav_div.innerHTML = menu;
          }
          collapsed = !collapsed
        };
      })
    }
  };

})(Drupal, jQuery);
