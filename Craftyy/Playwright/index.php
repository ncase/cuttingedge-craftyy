<head>
	<title>Playwright</title>
	<link rel="stylesheet" type="text/css" href="/Craftyy/Playwright/css/playwright.css">
</head>

<body>
	<div id="playwright"></div>
</body>

<!-- REQUIREMENTS -->
<script src='/Craftyy/js/core/Ajax.js'></script>
<script src='/Craftyy/js/core/Feed.js'></script>
<script src='/Craftyy/js/core/Promise.js'></script>
<script src='/Craftyy/js/playwright/Messenger.js'></script>
<script src='/Craftyy/js/playwright/Playwright.js'></script>
<script src='/Craftyy/js/playwright/Layout.js'></script>
<script src='/Craftyy/js/playwright/Loader.js'></script>
<script src='/Craftyy/js/playwright/Logic.js'></script>
<script src='/Craftyy/js/playwright/Edit.js'></script>

<script src="/Craftyy/js/playwright/Asset.js"></script>
<script src="/Craftyy/js/addons/playwright/AssetAddons.js"></script>
<script src="/Craftyy/js/addons/playwright/AssetHandlers.js"></script>
<script src='/Craftyy/js/addons/playwright/MessengerAddons.js'></script>

<!-- PLAYWRIGHT -->
<script>

Playwright.initialize({

	title: '<?php
		if( isset($theCreation["title"]) ){
			echo addslashes($theCreation["title"]);
		}else{
			echo "Something";
		}
	?>',
	
	logic: "/Craftyy/Playwright/logic/GameEditor.js",
	
	parentID: <?php
		if( isset($theCreation["id"]) ){
			echo $theCreation["id"];
		}else{
			echo "0";
		}
	?>,

	game: '<?php
		if( isset($theCreation["source"]) ){
			echo $theCreation["source"];
		}else{
			
			//echo "/Craftyy/assets/json/Functional.json";
			echo "/Craftyy/assets/json/DefaultProject.json";
			//echo "/Craftyy/assets/json/PonyJoustSource.json";

		}
	?>'
	
});

</script>
