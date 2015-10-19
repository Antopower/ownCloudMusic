<?php
script('musicapi', 'main');
script('musicapi', 'app');
script('musicapi', 'player');
script('musicapi', 'marques');
style('musicapi', 'style');
style('musicapi', 'player');
?>

<div id="app">
	<div id="app-navigation">
		<?php print_unescaped($this->inc('part.navigation')); ?>
		<?php print_unescaped($this->inc('part.settings')); ?>
	</div>

	<div id="app-content">
		<div id="app-content-wrapper">
			<?php print_unescaped($this->inc('part.content')); ?>
		</div>
	</div>
</div>
