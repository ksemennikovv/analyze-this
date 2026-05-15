<?php // features/footer.php ?>
<!-- Roller engine -->
<script src="/features/chat-roller/chat-roller.js"></script>
<!-- Page-specific JS injected by each feature -->
<?php if (!empty($pageJs)): foreach ($pageJs as $js): ?>
<script src="<?= htmlspecialchars($js) ?>"></script>
<?php endforeach; endif; ?>
</body>
</html>
