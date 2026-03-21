import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import UserCheckins from '../UserCheckins.vue';

// Mock vue-i18n
const mockT = (key) => key;

describe('UserCheckins.vue', () => {
  const mockCheckins = [
    {
      _id: '1',
      datetime: '2026-03-21T10:00:00Z',
      taskType: 'Test Task',
      imageRefs: ['ref1.png', 'ref2.png'],
      contributesTo: true
    }
  ];

  it('should not show images by default', () => {
    const wrapper = mount(UserCheckins, {
      props: {
        checkins: mockCheckins
      },
      global: {
        mocks: {
          $t: mockT
        },
        stubs: {
          'v-btn': true,
          'v-img': true,
          'v-chip': true,
          'v-dialog': true
        }
      }
    });

    // Images inside the list (images-section) should not be visible
    expect(wrapper.find('.images-section v-img-stub').exists()).toBe(false);
    // Find the toggle button
    const btn = wrapper.find('v-btn-stub');
    expect(btn.exists()).toBe(true);
  });

  it('should show images after calling toggleExpand', async () => {
    const wrapper = mount(UserCheckins, {
      props: {
        checkins: mockCheckins
      },
      global: {
        mocks: {
          $t: mockT
        },
        stubs: {
          'v-btn': true,
          'v-img': true,
          'v-chip': true,
          'v-dialog': true
        }
      }
    });

    // Call toggleExpand directly for the first checkin
    wrapper.vm.toggleExpand('1');
    await nextTick();

    // After clicking, images in the section should exist
    const imagesSection = wrapper.find('.images-section');
    expect(imagesSection.find('v-img-stub').exists()).toBe(true);
    expect(imagesSection.findAll('v-img-stub').length).toBe(2);
  });
});
