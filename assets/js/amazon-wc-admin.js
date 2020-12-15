/*global amazon_admin_params */
( function( $ ) {
	var wc_simple_path_form = {
		simple_path_form_id: 'simple_path',
		payment_region_input: $( '#woocommerce_amazon_payments_advanced_payment_region' ),
		action_url: '#',
		spId: '',
		register_now_link: $( 'a.register_now' ),
		delete_settings_link: $( 'a.delete-settings' ),
		onboarding_version: amazon_admin_params.onboarding_version,
		locale: amazon_admin_params.locale,
		home_url: amazon_admin_params.home_url,
		merchant_unique_id: amazon_admin_params.merchant_unique_id,
		public_key: amazon_admin_params.public_key,
		exchange_url: amazon_admin_params.simple_path_url,
		privacy_url: amazon_admin_params.privacy_url,
		site_description: amazon_admin_params.description,
		login_redirect_url: amazon_admin_params.login_redirect_url,
		woo_version: amazon_admin_params.woo_version,
		plugin_version: amazon_admin_params.plugin_version,
		poll_timer: false,
		poll_interval: 3000,
		main_setting_form: $( '#mainform' ),
		init: function() {
			// Init values if region is already selected
			wc_simple_path_form.payment_region_on_change();

			wc_simple_path_form.create_form();
			wc_simple_path_form.payment_region_input.on( 'change', this.payment_region_on_change );
			wc_simple_path_form.register_now_link.on( 'click', this.register_link_on_click );
			wc_simple_path_form.delete_settings_link.on( 'click', this.delete_settings_on_click );
			$( document ).on( 'click', 'a.wcapa-toggle-section', this.toggle_visibility );
		},
		payment_region_on_change: function() {
			if ( 'jp' === wc_simple_path_form.get_region_selected() ) {
				// JP does not have Simple Path Registration, we open a new url for it.
				wc_simple_path_form.register_now_link.attr( 'href', wc_simple_path_form.get_simple_path_url() );
				wc_simple_path_form.register_now_link.attr( 'target', '_blank' );
			} else {
				// For any other region, we use Simple Path form.
				wc_simple_path_form.register_now_link.attr( 'href', '#' );
				wc_simple_path_form.register_now_link.removeAttr( 'target' );

				// Updating values every time the region is changed.
				wc_simple_path_form.action_url = wc_simple_path_form.get_simple_path_url();
				wc_simple_path_form.spId = wc_simple_path_form.get_spId();

				$( '#' + wc_simple_path_form.simple_path_form_id ).attr( 'action', wc_simple_path_form.action_url );
				$( 'input[name=spId]' ).val( wc_simple_path_form.spId );
			}
		},
		set_credentials_values: function( merchant_id, store_id, public_key_id ) {
			//Seller Id
			$( '#woocommerce_amazon_payments_advanced_merchant_id' ).val( merchant_id );
			//MWS Access Key
			$( '#woocommerce_amazon_payments_advanced_store_id' ).val( store_id );
			//MWS Secret Key
			$( '#woocommerce_amazon_payments_advanced_public_key_id' ).val( public_key_id );
		},
		register_link_on_click: function( e ) {
			if ( $( this ).is( '.button-disabled' ) ) {
				e.preventDefault();
				e.stopPropagation();
				return;
			}
			// Trigger simple path form on all regions except JP.
			if ( 'jp' !== wc_simple_path_form.get_region_selected() ) {
				e.preventDefault();
				document.getElementById( wc_simple_path_form.simple_path_form_id ).submit.click();
				wc_simple_path_form.main_setting_form.block( {
					message: 'Waiting for Credentials From Amazon Seller Central',
					overlayCSS: {
						background: '#f1f1f1',
						opacity: .5
					}
				} );
				wc_simple_path_form.poll_timer = setTimeout( wc_simple_path_form.poll_for_keys, wc_simple_path_form.poll_interval );
			}
			$( '#woocommerce_amazon_payments_advanced_redirect_authentication' ).val( 'optimal' );
		},
		delete_settings_on_click: function( e ) {
			if ( $( this ).is( '.button-disabled' ) ) {
				e.preventDefault();
				e.stopPropagation();
				return;
			}
			e.preventDefault();
			if ( confirm( 'Disconnecting will clear your saved merchant credentials -- you will need to reconnect and sign into Amazon Pay in order to activate Amazon Pay again.' ) ) {
				$.ajax(
					{
						url: amazon_admin_params.ajax_url,
						data: {
							action: 'amazon_delete_credentials',
							nonce: amazon_admin_params.credentials_nonce
						},
						type: 'POST',
						success: function( result ) {
							location.reload();
						}
					}
				);
			}
		},
		create_form: function() {
			$( '.wrap.woocommerce' ).append(
				$(
					'<form/>',
					{
						id: wc_simple_path_form.simple_path_form_id,
						action: wc_simple_path_form.action_url,
						method: 'post',
						target: '_blank',
					}
				).append(
					$(
						'<input/>',
						{
							type: 'hidden',
							name: 'spId',
							value: wc_simple_path_form.spId
						}
					),
					$(
						'<input/>',
						{
							type: 'hidden',
							name: 'onboardingVersion',
							value: wc_simple_path_form.onboarding_version
						}
					),
					$(
						'<input/>',
						{
							type: 'hidden',
							name: 'publicKey',
							value: wc_simple_path_form.public_key
						}
					),
					$(
						'<input/>',
						{
							type: 'hidden',
							name: 'keyShareURL',
							value: wc_simple_path_form.exchange_url
						}
					),
					$(
						'<input/>',
						{
							type: 'hidden',
							name: 'locale',
							value: wc_simple_path_form.locale
						}
					),
					$(
						'<input/>',
						{
							type: 'hidden',
							name: 'merchantLoginDomains[]',
							value: wc_simple_path_form.home_url
						}
					),
					$(
						'<input/>',
						{
							type: 'hidden',
							name: 'spSoftwareVersion',
							value: wc_simple_path_form.woo_version
						}
					),
					$(
						'<input/>',
						{
							type: 'hidden',
							name: 'spAmazonPluginVersion',
							value: wc_simple_path_form.plugin_version
						}
					),
					$(
						'<input/>',
						{
							type: 'hidden',
							name: 'merchantLoginRedirectURLs[]',
							value: wc_simple_path_form.exchange_url
						}
					),
					$(
						'<input/>',
						{
							type: 'hidden',
							name: 'merchantLoginRedirectURLs[]',
							value: wc_simple_path_form.login_redirect_url
						}
					),
					$(
						'<input/>',
						{
							type: 'hidden',
							name: 'merchantPrivacyNoticeURL',
							value: wc_simple_path_form.privacy_url
						}
					),
					$(
						'<input/>',
						{
							type: 'hidden',
							name: 'merchantStoreDescription',
							value: wc_simple_path_form.site_description
						}
					),
					$(
						'<input/>',
						{
							type: 'hidden',
							name: 'source',
							value: 'SPPL'
						}
					),
					$(
						'<input/>',
						{
							type: 'submit',
							name: 'submit',
							style: 'display:none',
							value: 'submit'
						}
					)
				)
			);
		},
		get_region_selected: function() {
			return wc_simple_path_form.payment_region_input.val();
		},
		get_simple_path_url: function() {
			return amazon_admin_params.simple_path_urls[ wc_simple_path_form.get_region_selected() ];
		},
		get_spId: function() {
			return amazon_admin_params.spids[ wc_simple_path_form.get_region_selected() ];
		},
		poll_for_keys: function() {
			clearTimeout( wc_simple_path_form.poll_timer );
			$.ajax(
				{
					url: amazon_admin_params.ajax_url,
					data: {
						action: 'amazon_check_credentials',
						nonce: amazon_admin_params.credentials_nonce
					},
					type: 'GET',
					success: function( result ) {
						if ( -1 !== result.data ) {
							wc_simple_path_form.set_credentials_values(
								result.data.merchant_id,
								result.data.store_id,
								result.data.public_key_id
							);
							wc_simple_path_form.main_setting_form.unblock();
							$( '#mainform .notice-error' ).remove();
							wc_simple_path_form.register_now_link.toggleClass( 'button-disabled', true );
							wc_simple_path_form.delete_settings_link.toggleClass( 'button-disabled', false );
						} else {
							// Halt Polling.
							if ( false === wc_simple_path_form.poll_timer ) {
								return;
							}
							wc_simple_path_form.poll_timer = setTimeout( wc_simple_path_form.poll_for_keys, wc_simple_path_form.poll_interval );
						}
					}
				}
			);
		},
		toggle_visibility: function( e ) {
			e.preventDefault();
			$( $( this ).data( 'toggle' ) ).toggleClass( 'hidden' );
		}
	};
	wc_simple_path_form.init();

	$( '#import_submit' ).click( function( e ) {
		window.onbeforeunload = null;
	} );
} )( jQuery );
