package tech.logica10.soniclair;

import android.graphics.Bitmap;
import android.media.MediaDescription;
import android.media.browse.MediaBrowser;
import android.net.Uri;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.FutureTarget;
import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@CapacitorPlugin(name = "MediaBrowser")
public class MediaBrowserPlugin extends Plugin {
    ArrayList<MediaBrowser.MediaItem> mediaItems;

    @Override
    public void load(){
        mediaItems = new ArrayList<>();
    }

    @PluginMethod
    public void loadItems(PluginCall call) throws JSONException, ExecutionException, InterruptedException {
        JSArray array = call.getArray("items");
        List<JSONObject>itemArray = array.toList();
        ArrayList<MediaBrowser.MediaItem> mediaItemArray = new ArrayList<MediaBrowser.MediaItem>();
        MediaDescription.Builder builder = new MediaDescription.Builder();
        for(JSONObject item: itemArray){
            builder.setTitle(item.getString("song"));
            builder.setSubtitle(String.format("by %s", item.getString("artist")));
            Uri albumArtUri = Uri.parse(item.getString("albumArt"));
            FutureTarget<Bitmap> futureBitmap = Glide.with(MainActivity.context)
                    .asBitmap()
                    .load(albumArtUri)
                    .submit();
            Bitmap albumArtBitmap = futureBitmap.get();
            builder.setIconBitmap(albumArtBitmap);
            builder.setMediaId(item.getString("id"));
            mediaItemArray.add(new MediaBrowser.MediaItem(builder.build(), MediaBrowser.MediaItem.FLAG_PLAYABLE));
        }
        Globals.SetMediaItems(mediaItemArray);
    }
}

