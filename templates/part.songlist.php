<table style="width:100%">
    <thead>
        <th>Song Name</th>
        <th>Song Artist</th>
        <th>Song Bitrate</th>
        <th>Song Play Time</th>
        <th>Song Path</th>
    </thead>
    <tbody>
<?php foreach($_['songlist'] as $song){ ?>
    <tr data-path="<?php p($song['path']) ?>" class="song">
        <td><?php p($song['name']) ?></td>
        <td><?php p($song['artist']) ?></td>
        <td><?php p($song['bitrate']) ?></td>
        <td><?php p($song['playTime']) ?></td>
        <td><?php p($song['path']) ?></td>
    </tr>
<?php } ?>
    </tbody>
</table>