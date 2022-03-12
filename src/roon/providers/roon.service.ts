/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import chalk from 'chalk';
import RoonApi, { Core, MooMessage } from 'node-roon-api';
import RoonApiBrowse, { BrowseResult, LoadResult } from 'node-roon-api-browse';
import RoonApiImage, { ImageOption } from 'node-roon-api-image';
import RoonApiSettings, {
  GetSettingCallback,
  RoonSetting,
  SettingValues,
} from 'node-roon-api-settings';
import RoonApiStatus from 'node-roon-api-status';
import RoonApiTransport, {
  MusicStatus,
  RoonData,
  Zone,
} from 'node-roon-api-transport';
import { promisify } from 'util';
import { IMAGE_OPTION_DEFAULT, ROON_CONFIG } from '../roon.constant';
import {
  CurrentSong,
  ImageResult,
  RoonModuleConfig,
  SettingConfig,
} from '../roon.interface';
import { AnyFunction } from '../../shared/interfaces';

@Injectable()
export class RoonService implements OnApplicationBootstrap {
  private roon: RoonApi;
  private core: Core;
  private statusService: RoonApiStatus;
  private transportService?: RoonApiTransport;
  private browseService?: RoonApiBrowse;
  private imageService?: RoonApiImage;
  private settingService: RoonApiSettings;
  private zones?: Zone[];
  private setting?: SettingConfig;

  public currentSong?: CurrentSong;

  public get currentZone() {
    if (!this.setting) return undefined;
    return this.zones?.find((z) => z.display_name === this.setting!.zone.name);
  }

  private setCurrentZoneState(zonesChanged: Zone): void {
    this.zones?.forEach((z) => {
      if (z.zone_id === zonesChanged.zone_id) {
        z.state = zonesChanged.state;
      }
    });
  }

  public get currentOutput() {
    if (!this.setting) return undefined;
    return this.zones
      ?.flatMap((z) => z.outputs)
      .find((o) => o.output_id === this.setting!.zone.output_id);
  }

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(ROON_CONFIG) config: RoonModuleConfig,
  ) {
    this.roon = new RoonApi({
      ...config,
      core_paired: (core) => this.handleCorePaired(core),
      core_unpaired: (core) => this.handleCoreUnpaired(core),
    });
    this.statusService = new RoonApiStatus(this.roon);
    this.settingService = new RoonApiSettings(this.roon, {
      get_settings: (cb) => this.handleGetSetting(cb),
      save_settings: (req, isdryrun, settings) =>
        this.handleSaveSetting(req, isdryrun, settings),
    });
  }

  onApplicationBootstrap() {
    const settingCache = this.roon.load_config<SettingConfig>('settings');
    if (settingCache) this.setting = settingCache;

    this.roon.init_services({
      required_services: [RoonApiTransport, RoonApiBrowse, RoonApiImage],
      provided_services: [this.statusService, this.settingService],
    });
    this.statusService.set_status('yee', false);
    this.roon.start_discovery();
  }

  setStatus = (status: string): void =>
    this.statusService.set_status(status, false);

  play = (): Promise<void> =>
    this.promisifyTransportMethod(
      this.transportService?.control,
      this.currentOutput!,
      'play',
    );

  pause = (): Promise<void> =>
    this.promisifyTransportMethod(
      this.transportService?.control,
      this.currentOutput!,
      'pause',
    );

  togglePlayPause = (): Promise<void> =>
    this.promisifyTransportMethod(
      this.transportService?.control,
      this.currentOutput!,
      'playpause',
    );

  stop = (): Promise<void> =>
    this.promisifyTransportMethod(
      this.transportService?.control,
      this.currentOutput!,
      'stop',
    );

  previous = (): Promise<void> =>
    this.promisifyTransportMethod(
      this.transportService?.control,
      this.currentOutput!,
      'previous',
    );

  next = (): Promise<void> =>
    this.promisifyTransportMethod(
      this.transportService?.control,
      this.currentOutput!,
      'next',
    );

  mute = (): Promise<void> =>
    this.promisifyTransportMethod(
      this.transportService?.mute,
      this.currentOutput!,
      'mute',
    );

  unmute = (): Promise<void> =>
    this.promisifyTransportMethod(
      this.transportService?.mute,
      this.currentOutput!,
      'unmute',
    );

  shuffle = (): Promise<void> =>
    this.promisifyTransportMethod(
      this.transportService?.change_settings,
      this.currentOutput!,
      { shuffle: true },
    );

  doBrowse = (item_key: string): Promise<BrowseResult> =>
    promisify(this.browseService!.browse).bind(this.browseService)({
      hierarchy: 'browse',
      item_key,
    });

  doLoad = (): Promise<LoadResult> =>
    promisify(this.browseService!.load).bind(this.browseService)({
      hierarchy: 'browse',
      offset: 0,
      set_display_offset: 0,
    });

  browseList = (item_key: string): Promise<LoadResult> =>
    this.doBrowse(item_key).then(() => this.doLoad());

  getImage(
    image_key: string,
    options: ImageOption = IMAGE_OPTION_DEFAULT,
  ): Promise<ImageResult> {
    return new Promise((resolve, reject) => {
      this.imageService!.get_image(image_key, options, (err, type, image) => {
        if (err) {
          return reject(err);
        }
        resolve({ type, image });
      });
    });
  }

  private makeSettingLayout = (setting: SettingValues): RoonSetting => ({
    values: setting,
    layout: [
      {
        type: 'label',
        title: 'YEEEEEEEE',
      },
      {
        type: 'zone',
        title: 'Zone',
        setting: 'zone',
      },
    ],
    has_error: false,
  });

  private handleCorePaired(core: Core): void {
    this.core = core;
    this.transportService = core.services.RoonApiTransport;
    this.browseService = core.services.RoonApiBrowse;
    this.imageService = core.services.RoonApiImage;

    if (this.transportService) {
      this.transportService.subscribe_zones((cmd, data) => {
        console.log(
          chalk.green(
            'My log:',
            `${this.core.core_id} ${this.core.display_name} ${this.core.display_version} - ${cmd}`,
          ),
        );
        console.log(chalk.yellow(JSON.stringify(data, null, 2)));
        this.onTransportChanged(cmd, data);
      });
    }
  }

  private handleCoreUnpaired(core: Core): void {
    console.log(
      core.core_id,
      core.display_name,
      core.display_version,
      '-',
      'LOST',
    );
  }

  private handleGetSetting(cb: GetSettingCallback): void {
    console.log('Current settings:', this.setting);
    cb(this.makeSettingLayout(this.setting ?? {}));
  }

  private handleSaveSetting(
    req: MooMessage,
    isdryrun: boolean,
    settings: RoonSetting,
  ): void {
    const l = this.makeSettingLayout(settings.values);

    req.send_complete(l.has_error ? 'NotValid' : 'Success', {
      settings: l,
    });

    if (!isdryrun && !l.has_error) {
      this.setting = l.values as SettingConfig;
      console.log('New settings:', this.setting);
      this.settingService.update_settings(l);
      this.roon.save_config('settings', this.setting);
    }
  }

  private onTransportChanged(cmd: string, data: RoonData): void {
    if (cmd === 'Subscribed') {
      this.zones = data.zones;
      const { now_playing } = this.currentZone!;
      this.setCurrentSongFromMusicStatus(now_playing);
    } else if (cmd === 'Changed' && data.zones_changed) {
      const { now_playing } = data.zones_changed[0];
      this.setCurrentZoneState(data.zones_changed[0]);
      this.setCurrentSongFromMusicStatus(now_playing);
    } else if (
      cmd === 'Changed' &&
      data.zones_seek_changed &&
      this.currentSong
    ) {
      this.currentSong.seek_position = data.zones_seek_changed[0].seek_position;
    }
    this.emitEventFromState();
  }

  private setCurrentSongFromMusicStatus(now: MusicStatus): void {
    if (this.currentZone?.state === 'stopped') {
      this.currentSong = undefined;
      return;
    }
    const { line1, line2, line3 } = now.three_line;
    this.currentSong = {
      ...now,
      title: line1,
      artist: line2,
      album: line3,
      status: this.currentZone?.state,
    };
  }

  private emitEventFromState(): void {
    const state = this.currentZone?.state;
    this.eventEmitter.emit(`music.${state}`, this.currentSong);
  }

  private promisifyTransportMethod<
    Args extends any[],
    Returned extends unknown,
  >(fn?: AnyFunction<Args, Returned>, ...args: Args): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!fn) return reject('Transport service have not initiated yet!');
      const yee = [args[0], args[1]] as const;
      fn.bind(this.transportService)(...yee, (res: false | string) => {
        if (!res) {
          resolve();
        }
        return reject(res);
      });
    });
  }
}
