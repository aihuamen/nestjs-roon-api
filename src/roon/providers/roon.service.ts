/* eslint-disable @typescript-eslint/unbound-method */
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import chalk from 'chalk';
import RoonApi, { type Core, type MooMessage } from 'node-roon-api';
import RoonApiBrowse, {
  type BrowseResult,
  type LoadResult,
} from 'node-roon-api-browse';
import RoonApiImage, { type ImageOption } from 'node-roon-api-image';
import RoonApiSettings, {
  type GetSettingCallback,
  type RoonSetting,
  type SettingValues,
} from 'node-roon-api-settings';
import RoonApiStatus from 'node-roon-api-status';
import RoonApiTransport, {
  type MusicStatus,
  type RoonData,
  type Zone,
} from 'node-roon-api-transport';
import { promisify } from 'util';
import { IMAGE_OPTION_DEFAULT, ROON_CONFIG } from '../roon.constant.js';
import {
  type CurrentSong,
  type ImageResult,
  type PlayerSetting,
  type RoonModuleConfig,
  type SettingConfig,
} from '../roon.interface.js';
import { type AnyFunction } from '../../shared/interfaces/index.js';
import { PromiseDefer } from '../../shared/utils/PromiseDefer.js';
import { FileService } from '../../file/file.service.js';

@Injectable()
export class RoonService implements OnApplicationBootstrap {
  private roon: RoonApi;
  private core?: Core;
  private statusService: RoonApiStatus;
  private transportService?: RoonApiTransport;
  private browseService?: RoonApiBrowse;
  private imageService?: RoonApiImage;
  private settingService: RoonApiSettings;
  private zones?: Zone[];
  private setting?: SettingConfig;

  private promiseDefer!: PromiseDefer<void>;

  public currentSong?: CurrentSong;
  public playerSetting!: PlayerSetting;

  private readonly logger = new Logger(RoonService.name);

  public get currentZone() {
    if (!this.setting) return undefined;
    return this.zones?.find((z) => z.display_name === this.setting!.zone.name);
  }

  public get currentOutput() {
    if (!this.setting) return undefined;
    return this.zones
      ?.flatMap((z) => z.outputs)
      .find((o) => o.output_id === this.setting!.zone.output_id);
  }

  public get isReady() {
    return !!this.core;
  }

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly fileService: FileService,
    @Inject(ROON_CONFIG) config: RoonModuleConfig,
  ) {
    this.roon = new RoonApi({
      ...config,
      core_paired: this.handleCorePaired.bind(this),
      core_unpaired: this.handleCoreUnpaired.bind(this),
    });
    this.statusService = new RoonApiStatus(this.roon);
    this.settingService = new RoonApiSettings(this.roon, {
      get_settings: this.handleGetSetting.bind(this),
      save_settings: this.handleSaveSetting.bind(this),
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

  async play(): Promise<void> {
    if (this.currentSong?.status === 'playing') return;
    await this.promisifyTransportMethod(
      this.transportService?.control,
      this.currentOutput!,
      'play',
    );
    await this.promiseDefer.promise;
  }

  async pause(): Promise<void> {
    if (this.currentSong?.status === 'paused') return;
    await this.promisifyTransportMethod(
      this.transportService?.control,
      this.currentOutput!,
      'pause',
    );
    await this.promiseDefer.promise;
  }

  async togglePlayPause(): Promise<void> {
    await this.promisifyTransportMethod(
      this.transportService?.control,
      this.currentOutput!,
      'playpause',
    );
    await this.promiseDefer.promise;
  }

  async stop(): Promise<void> {
    await this.promisifyTransportMethod(
      this.transportService?.control,
      this.currentOutput!,
      'stop',
    );
    await this.promiseDefer.promise;
  }

  async previous(): Promise<void> {
    await this.promisifyTransportMethod(
      this.transportService?.control,
      this.currentOutput!,
      'previous',
    );
    await this.promiseDefer.promise;
  }

  async next(): Promise<void> {
    await this.promisifyTransportMethod(
      this.transportService?.control,
      this.currentOutput!,
      'next',
    );
    await this.promiseDefer.promise;
  }

  async mute(): Promise<void> {
    if (this.playerSetting.mute === undefined) {
      throw new BadRequestException('This output is on exclusive mode');
    }

    if (this.playerSetting.mute) return Promise.resolve();
    await this.promisifyTransportMethod(
      this.transportService?.mute,
      this.currentOutput!,
      'mute',
    );
    await this.promiseDefer.promise;
  }

  async unmute(): Promise<void> {
    if (this.playerSetting.mute === undefined) {
      throw new BadRequestException('This output is on exclusive mode');
    }

    if (!this.playerSetting.mute) return Promise.resolve();
    await this.promisifyTransportMethod(
      this.transportService?.mute,
      this.currentOutput!,
      'unmute',
    );
    await this.promiseDefer.promise;
  }

  async toggleMute(): Promise<void> {
    if (this.playerSetting.mute === undefined) {
      throw new BadRequestException('This output is on exclusive mode');
    }
    await this.promisifyTransportMethod(
      this.transportService?.change_settings,
      this.currentOutput!,
      { shuffle: !this.playerSetting.mute },
    );
    await this.promiseDefer.promise;
  }

  async shuffle(): Promise<void> {
    if (this.playerSetting.shuffle) return Promise.resolve();
    await this.promisifyTransportMethod(
      this.transportService?.change_settings,
      this.currentOutput!,
      { shuffle: true },
    );
    await this.promiseDefer.promise;
  }

  async unshuffle(): Promise<void> {
    if (!this.playerSetting.shuffle) return Promise.resolve();
    await this.promisifyTransportMethod(
      this.transportService?.change_settings,
      this.currentOutput!,
      { shuffle: false },
    );
    await this.promiseDefer.promise;
  }

  async toggleShuffle(): Promise<void> {
    await this.promisifyTransportMethod(
      this.transportService?.change_settings,
      this.currentOutput!,
      { shuffle: !this.playerSetting.shuffle },
    );
    await this.promiseDefer.promise;
  }

  async changeVolume(vol: number): Promise<void> {
    if (!this.playerSetting.volume) {
      throw new BadRequestException('This output is on exclusive mode!');
    }
    await this.promisifyTransportMethod(
      this.transportService?.change_volume,
      this.currentOutput!,
      'absolute',
      vol,
    );
    await this.promiseDefer.promise;
  }

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
      if (!this.imageService)
        return reject('Image service has not initiated yet!');
      this.imageService.get_image(image_key, options, (err, type, image) => {
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
        this.logger.log(
          chalk.green(
            'My log:',
            `${this.core!.core_id} ${this.core!.display_name} ${
              this.core!.display_version
            } - ${cmd}`,
          ),
        );
        console.log(chalk.yellow(JSON.stringify(data, null, 2)));
        return this.onTransportChanged(cmd, data);
      });
    }
  }

  private handleCoreUnpaired(core: Core): void {
    this.logger.log(
      core.core_id,
      core.display_name,
      core.display_version,
      '-',
      'LOST',
    );
  }

  private handleGetSetting(cb: GetSettingCallback): void {
    this.logger.log('Current settings:', this.setting);
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
      this.logger.log('New settings:', this.setting);
      this.settingService.update_settings(l);
      this.roon.save_config('settings', this.setting);
    }
  }

  private async onTransportChanged(cmd: string, data: RoonData) {
    if (cmd === 'Subscribed') {
      this.zones = data.zones;
      if (!this.currentZone) return;
      const { now_playing } = this.currentZone;
      this.setCurrentSongFromMusicStatus(now_playing);
      this.updatePlayerSetting();
    } else if (cmd === 'Changed' && data.zones_changed) {
      const { now_playing } = data.zones_changed[0];
      this.updateCurrentZone(data.zones_changed[0]);
      this.setCurrentSongFromMusicStatus(now_playing);
      this.updatePlayerSetting();
      if (this.promiseDefer) {
        this.promiseDefer.resolve();
      }
      await this.cacheImage();
    } else if (
      cmd === 'Changed' &&
      data.zones_seek_changed &&
      this.currentSong
    ) {
      this.currentSong.seek_position = data.zones_seek_changed[0].seek_position;
    }
    this.emitEventFromState();
  }

  private updateCurrentZone(zonesChanged: Zone): void {
    this.zones = this.zones?.map((z) =>
      z.zone_id === zonesChanged.zone_id ? zonesChanged : z,
    );
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

  private updatePlayerSetting(): void {
    this.playerSetting = {
      shuffle: this.currentZone!.settings.shuffle,
      volume: this.currentOutput!.volume?.value,
      mute: this.currentOutput!.volume?.is_muted,
    };
  }

  private emitEventFromState(): void {
    const state = this.currentZone?.state;
    this.eventEmitter.emit(`music.${state}`, this.currentSong);
  }

  private promisifyTransportMethod<Args extends any[]>(
    fn: AnyFunction<Args> | undefined,
    ...args: Args
  ): Promise<void> {
    if (!fn) {
      return Promise.reject(
        'This method is undefined or transport service has not initiated yet!',
      );
    }
    const isTransportMethod = Object.values(
      Object.getPrototypeOf(this.transportService),
    ).some((m) => m === fn);

    if (!isTransportMethod) {
      return Promise.reject('This is not transport service method!');
    }
    this.promiseDefer = new PromiseDefer();
    return new Promise((resolve, reject) => {
      const argsNoCB = args.slice(0, fn.length - 1);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fn.bind(this.transportService)(...argsNoCB, (res: false | string) => {
        if (!res) {
          resolve();
        }
        return reject(res);
      });
    });
  }

  private async cacheImage() {
    const imageKey = this.currentSong?.image_key;
    if (!imageKey) return;
    const isExist = this.fileService.checkImageExist(imageKey);
    if (isExist) return;

    const { type, image } = await this.getImage(imageKey);
    await this.saveImage(imageKey, image, type);
  }

  private async saveImage(id: string, image: Buffer, type?: string) {
    await this.fileService.saveImage(id, image, type);
  }
}
