<?php
// shared/layout/footer.php
?>
<!-- Roller engine -->
<script src="/shared/rollers/roller-engine.js"></script>
<!-- Page-specific JS injected by each feature -->
<?php if (!empty($pageJs)): foreach ($pageJs as $js): ?>
<script src="<?= htmlspecialchars($js) ?>"></script>
<?php endforeach; endif; ?>
</body>
</html>
